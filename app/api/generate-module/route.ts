import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// ─── Firebase Admin (server-side, untuk cache tanpa Auth client) ──────────────
function getAdminDb() {
  // Hanya inisialisasi jika credentials tersedia
  const clientEmail = process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!clientEmail || !privateKey || !projectId) {
    throw new Error("Firebase Admin credentials belum dikonfigurasi (FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY).");
  }

  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });
  }
  return getFirestore(getApp());
}

const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

export async function POST(req: Request) {
  if (!API_KEY) {
    return NextResponse.json({ success: false, error: "API Key Gemini belum diatur di server." }, { status: 500 });
  }

  try {
    const { path, moduleLevel, moduleName } = await req.json();
    const cacheKey = `${path}_level_${moduleLevel}`;

    // ─── 1. Cek cache Firestore ───────────────────────────────────────────────
    try {
      const db = getAdminDb();
      const cacheSnap = await db.collection("moduleCache").doc(cacheKey).get();
      if (cacheSnap.exists) {
        console.log(`[generate-module] Cache HIT: ${cacheKey}`);
        return NextResponse.json({ success: true, data: cacheSnap.data(), cached: true });
      }
      console.log(`[generate-module] Cache MISS: ${cacheKey} — memanggil Gemini AI...`);
    } catch {
      // Firebase Admin belum dikonfigurasi / credentials belum ada, lanjut generate
      console.warn("[generate-module] Cache tidak tersedia, lanjut generate.");
    }

    // ─── 2. Generate dari Gemini ──────────────────────────────────────────────
    const genAI = new GoogleGenerativeAI(API_KEY);
    const isJapanese = path === "samurai";

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `Anda adalah seorang profesor bahasa ${isJapanese ? "Jepang (JLPT N5) untuk Samurai Path" : "Mandarin (HSK 1) untuk Dragon Path"} yang berpengalaman.
WAJIB: Gunakan HANYA karakter ${isJapanese ? "Jepang (Kanji/Hiragana/Katakana)" : "Mandarin (Hanzi)"}.
DILARANG KERAS menggunakan karakter ${isJapanese ? "Mandarin/Hanzi China" : "Jepang (Hiragana/Katakana)"} kecuali arti dalam Bahasa Indonesia.

Buatlah materi pembelajaran yang SANGAT KOMPREHENSIF untuk modul tingkat ${moduleLevel} dengan topik "${moduleName}".

Kembalikan HANYA objek JSON berikut (tanpa teks lain):
{
  "title": "Judul topik dalam ${isJapanese ? "bahasa Jepang (beserta furigana)" : "bahasa Mandarin"}",
  "description": "Deskripsi 2-3 kalimat dalam bahasa Indonesia tentang apa yang akan dipelajari",
  "vocabulary": [
    {
      "char": "karakter asli (${isJapanese ? "Kanji/Hiragana" : "Hanzi"})",
      "reading": "cara baca (${isJapanese ? "Romaji" : "Pinyin dengan nada misal: yī, èr, sān"})",
      "meaning": "arti bahasa Indonesia",
      "example": "contoh kalimat singkat dalam ${isJapanese ? "bahasa Jepang" : "bahasa Mandarin"}",
      "exampleReading": "cara baca contoh kalimat (${isJapanese ? "romaji" : "pinyin"})",
      "exampleMeaning": "arti contoh kalimat dalam bahasa Indonesia"
    }
  ],
  "characters": [
    {
      "char": "satu karakter ${isJapanese ? "Hiragana atau Katakana" : "Hanzi"} yang relevan dengan topik",
      "type": "${isJapanese ? "hiragana atau katakana" : "hanzi"}",
      "strokeCount": 3,
      "strokeOrder": "Penjelasan DETAIL langkah demi langkah tata cara menulis goresannya dalam bahasa Indonesia. Contoh: 'Goresan 1: Mulai dari kiri atas, tarik garis horizontal ke kanan. Goresan 2: ...'",
      "mnemonicTip": "Tips kreatif untuk mengingat karakter ini (misalnya analogi bentuk atau cerita pendek)"
    }
  ],
  "culturalNote": "Catatan budaya yang menarik dan informatif berkaitan dengan topik ${moduleName} di ${isJapanese ? "Jepang" : "China"} (2-3 kalimat)",
  "quest": "Satu misi seru yang SPESIFIK dan bisa langsung dilakukan hari ini untuk mempraktikkan materi ${moduleName}"
}

WAJIB hasilkan:
- MINIMAL 12 vocabulary (masing-masing dengan contoh kalimat lengkap)
- MINIMAL 5 characters (dengan stroke order detail dan tips mengingat)
- Cultural note yang informatif
- Quest yang kreatif dan spesifik`;

    const result = await model.generateContent(prompt);
    const moduleData = JSON.parse(result.response.text());

    // ─── 3. Simpan ke Firestore cache ─────────────────────────────────────────
    try {
      const db = getAdminDb();
      await db.collection("moduleCache").doc(cacheKey).set({
        ...moduleData,
        generatedAt: new Date().toISOString(),
        path,
        moduleLevel,
        moduleName,
      });
      console.log(`[generate-module] Cache SAVED: ${cacheKey}`);
    } catch {
      console.warn("[generate-module] Gagal menyimpan cache ke Firestore.");
    }

    return NextResponse.json({ success: true, data: moduleData, cached: false });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[generate-module] Error:", message);
    return NextResponse.json({ success: false, error: `Gagal: ${message}` }, { status: 500 });
  }
}

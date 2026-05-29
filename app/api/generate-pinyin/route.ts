import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

// ─── Firebase Admin (server-side, untuk cache tanpa Auth client) ──────────────
function getAdminDb() {
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!clientEmail || !privateKey || !projectId) {
    throw new Error("Firebase Admin credentials belum dikonfigurasi.");
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

const API_KEY = process.env.GEMINI_API_KEY || "";

export async function GET() {
  if (!API_KEY) {
    return NextResponse.json({ success: false, error: "API Key Gemini belum diatur di server." }, { status: 500 });
  }

  try {
    const todayDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const cacheKey = `pinyin_daily_${todayDate}`;

    // ─── 1. Cek cache Firestore ───────────────────────────────────────────────
    try {
      const db = getAdminDb();
      const cacheSnap = await db.collection("gameCache").doc(cacheKey).get();
      if (cacheSnap.exists) {
        console.log(`[generate-pinyin] Cache HIT: ${cacheKey}`);
        return NextResponse.json({ success: true, data: cacheSnap.data()?.questions, cached: true });
      }
      console.log(`[generate-pinyin] Cache MISS: ${cacheKey} — memanggil Gemini AI...`);
    } catch {
      console.warn("[generate-pinyin] Cache tidak tersedia, lanjut generate.");
    }

    // ─── 2. Generate dari Gemini ──────────────────────────────────────────────
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `Buatkan tepat 12 kosakata/karakter Mandarin acak untuk latihan tebak nada (pinyin tones).
Variasikan nada (1, 2, 3, dan 4) secara proporsional. Pastikan kosakatanya adalah kosakata HSK 1 - HSK 3 yang umum dipakai sehari-hari.

Kembalikan HANYA array JSON berikut:
[
  {
    "char": "karakter mandarin (hanzi, maksimal 1 atau 2 karakter)",
    "pinyin": "pinyin dengan tanda nada (misal: mā, má, mǎ, mà)",
    "tone": 1, // angka nada (1, 2, 3, atau 4). Jika hanzi terdiri dari 2 karakter, gunakan nada karakter pertama.
    "name": "nama nada (misal: 'Nada 1', 'Nada 2', dst)",
    "mark": "tanda nada (gunakan '—' untuk nada 1, '／' untuk nada 2, '∨' untuk nada 3, '＼' untuk nada 4)",
    "meaning": "arti bahasa Indonesia singkat"
  }
]
`;

    const result = await model.generateContent(prompt);
    let questions = JSON.parse(result.response.text());

    // ─── 3. Simpan ke Firestore cache ─────────────────────────────────────────
    try {
      const db = getAdminDb();
      await db.collection("gameCache").doc(cacheKey).set({
        questions,
        generatedAt: new Date().toISOString(),
      });
      console.log(`[generate-pinyin] Cache SAVED: ${cacheKey}`);
    } catch (err) {
      console.warn("[generate-pinyin] Gagal menyimpan cache ke Firestore.", err);
    }

    return NextResponse.json({ success: true, data: questions, cached: false });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[generate-pinyin] Error:", message);
    return NextResponse.json({ success: false, error: `Gagal: ${message}` }, { status: 500 });
  }
}

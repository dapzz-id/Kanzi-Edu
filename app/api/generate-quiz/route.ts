import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY|| "";

export async function POST(req: Request) {
  if (!API_KEY) {
    return NextResponse.json({ success: false, error: "API Key Gemini belum diatur di server." }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(API_KEY);

  try {
    const { path, moduleLevel, moduleName } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `Anda adalah guru bahasa ${path === "samurai" ? "Jepang (Samurai Path)" : "Mandarin (Dragon Path)"}.
WAJIB: Pastikan kalimat pertanyaan/instruksi (field "text") ditulis dalam BAHASA INDONESIA. Anda HANYA boleh menggunakan karakter ${path === "samurai" ? "Jepang (Kanji/Hiragana/Katakana)" : "Mandarin (Hanzi)"} pada bagian materi yang sedang diuji (contoh: "Apa arti dari karakter X?" atau pada opsi jawaban).
DILARANG KERAS menggunakan karakter ${path === "samurai" ? "Mandarin/Hanzi China" : "Jepang (Hiragana/Katakana)"}.

Buatlah kuis kelulusan untuk modul tingkat ${moduleLevel} dengan topik "${moduleName}".

Kembalikan HANYA objek JSON berikut, tanpa teks lain:
{
  "multipleChoice": [
    {
      "id": 1,
      "text": "Pertanyaan (WAJIB Bahasa Indonesia) mengenai kosakata atau karakter ${path === "samurai" ? "Jepang" : "Mandarin"}. Contoh: 'Apa arti dari karakter ...?' atau 'Pilih terjemahan yang tepat untuk ...'",
      "options": ["A. opsi 1", "B. opsi 2", "C. opsi 3", "D. opsi 4", "E. opsi 5"],
      "correctAnswer": "A"
    }
  ],
  "essay": {
    "text": "Satu pertanyaan esai (WAJIB Bahasa Indonesia) yang menuntut jawaban ${path === "samurai" ? "romaji" : "pinyin"} atau arti bahasa Indonesia. Contoh: 'Bagaimana cara membaca karakter ...?'"
  }
}

Buat tepat 5 pertanyaan pilihan ganda (A-E) dan 1 pertanyaan esai.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const quizData = JSON.parse(response.text());

    return NextResponse.json({ success: true, data: quizData });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[generate-quiz] Error:", message);
    return NextResponse.json({ success: false, error: `Gagal: ${message}` }, { status: 500 });
  }
}

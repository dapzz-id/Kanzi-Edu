import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

export async function POST(req: Request) {
  if (!API_KEY) {
    return NextResponse.json({ success: false, error: "API Key Gemini belum diatur di server." }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(API_KEY);

  try {
    const { question, answer, path } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `Anda adalah guru bahasa ${path === "samurai" ? "Jepang" : "Mandarin"} yang baik hati namun teliti.
Seorang murid diberikan soal esai berikut:
"${question}"

Murid tersebut menjawab:
"${answer}"

Tugas Anda:
1. Evaluasi apakah jawaban tersebut benar secara makna atau konteks.
2. Jika ada sedikit salah ketik (typo) pada romaji/pinyin, tetap anggap BENAR namun berikan catatan koreksi yang ramah.
3. Kembalikan HANYA objek JSON berikut, tanpa teks lain:

{
  "isCorrect": true,
  "feedback": "Umpan balik dari Anda sebagai guru"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const validationData = JSON.parse(response.text());

    return NextResponse.json({ success: true, data: validationData });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[validate-essay] Error:", message);
    return NextResponse.json({ success: false, error: `Gagal: ${message}` }, { status: 500 });
  }
}

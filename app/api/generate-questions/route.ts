import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Inisialisasi SDK dengan API Key dari Environment Variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { path, count = 5 } = body; // path: 'samurai' atau 'dragon'

    const language = path === "samurai" ? "Bahasa Jepang (Fokus Kanji level JLPT N5)" : "Bahasa Mandarin (Fokus Hanzi level HSK 1)";
    
    const prompt = `Buatkan ${count} soal kuis menjodohkan karakter ${language} dengan arti Bahasa Indonesianya.
Format kembalian HARUS berupa array JSON valid tanpa tambahan teks lain, seperti ini:
[
  {
    "char": "karakter asli",
    "correct": "arti bahasa indonesia",
    "options": ["pilihan salah 1", "pilihan salah 2", "arti bahasa indonesia", "pilihan salah 3"]
  }
]
Pastikan "options" selalu berjumlah tepat 4 dan posisi "correct" diacak.`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON array from Markdown block if necessary
    const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const questions = JSON.parse(jsonStr);

    return NextResponse.json({ success: true, questions });
  } catch (error: unknown) {
    console.error("Error generating questions with Gemini AI:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghasilkan soal dari AI." },
      { status: 500 }
    );
  }
}

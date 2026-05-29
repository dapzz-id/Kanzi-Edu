import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { path, level = 1, count = 3 } = body;

    const language = path === "samurai" ? "Bahasa Jepang (Fokus level JLPT N5)" : "Bahasa Mandarin (Fokus level HSK 1)";
    const difficultyStr = level > 5 ? "kalimat sedikit lebih panjang/menengah" : "kalimat pendek dasar";
    
    const prompt = `Buatkan ${count} soal menyusun kalimat (puzzle kalimat) dalam ${language}. Kesulitan: ${difficultyStr}.
Format kembalian HARUS berupa array JSON valid tanpa tambahan teks lain, seperti ini:
[
  {
    "words": ["kata1", "kata2", "kata3"],
    "translation": "arti kalimat secara utuh dalam bahasa indonesia"
  }
]
Pastikan urutan dalam array "words" adalah urutan yang BENAR dan TEPAT dari kalimat aslinya (jangan diacak di dalam JSON, karena akan diacak di frontend).`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON array
    const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const puzzles = JSON.parse(jsonStr);

    return NextResponse.json({ success: true, puzzles });
  } catch (error: unknown) {
    console.error("Error generating puzzles with Gemini AI:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghasilkan puzzle dari AI." },
      { status: 500 }
    );
  }
}

"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Volume2, CheckCircle2, XCircle, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PINYIN_QUESTIONS = [
  { char: "妈", pinyin: "mā", tone: 1, name: "Nada 1 (Datar/Tinggi)", mark: "—", meaning: "Ibu" },
  { char: "麻", pinyin: "má", tone: 2, name: "Nada 2 (Naik)", mark: "／", meaning: "Rami/Ganja" },
  { char: "马", pinyin: "mǎ", tone: 3, name: "Nada 3 (Melengkung)", mark: "∨", meaning: "Kuda" },
  { char: "骂", pinyin: "mà", tone: 4, name: "Nada 4 (Turun)", mark: "＼", meaning: "Memaki" },
  { char: "衣", pinyin: "yī", tone: 1, name: "Nada 1", mark: "—", meaning: "Baju" },
  { char: "移", pinyin: "yí", tone: 2, name: "Nada 2", mark: "／", meaning: "Pindah" },
  { char: "椅", pinyin: "yǐ", tone: 3, name: "Nada 3", mark: "∨", meaning: "Kursi" },
  { char: "意", pinyin: "yì", tone: 4, name: "Nada 4", mark: "＼", meaning: "Maksud" },
];

export default function PinyinCheckGame() {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [status, setStatus] = useState<"playing" | "correct" | "wrong" | "done">("playing");
  const [lastSelected, setLastSelected] = useState<number | null>(null);

  const q = PINYIN_QUESTIONS[currentQ];

  const playAudio = () => {
    const utterance = new SpeechSynthesisUtterance(q.char);
    utterance.lang = "zh-CN";
    window.speechSynthesis.speak(utterance);
  };

  const handleAnswer = (toneIndex: number) => {
    setLastSelected(toneIndex);
    if (toneIndex + 1 === q.tone) {
      setStatus("correct");
    } else {
      setStatus("wrong");
    }
  };

  const nextQuestion = () => {
    if (currentQ < PINYIN_QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
      setStatus("playing");
      setLastSelected(null);
    } else {
      setStatus("done");
    }
  };

  const retryQuestion = () => {
    setStatus("playing");
    setLastSelected(null);
  };

  if (status === "done") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <CheckCircle2 size={100} className="text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Latihan Selesai!</h1>
          <p className="text-xl text-foreground/70 mb-8 max-w-md mx-auto">Telinga Nagamu semakin tajam dalam membedakan nada.</p>
          <Button size="lg" variant="dragon" className="text-lg px-8 py-6 h-auto font-bold" onClick={() => router.push("/dashboard")}>
            Kembali ke Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 bg-gradient-to-b from-background to-secondary/10">
      {/* Header */}
      <div className="flex justify-between items-center max-w-2xl mx-auto w-full mb-8 pt-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
          <ArrowLeft />
        </Button>
        <div className="text-center">
          <h1 className="text-xl font-bold">Latihan Nada (Tone)</h1>
          <p className="text-xs text-foreground/50 uppercase tracking-widest font-bold">Progress: {currentQ + 1} / {PINYIN_QUESTIONS.length}</p>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        {/* Main Character Card */}
        <Card className="w-full mb-8 glass border-secondary/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-secondary/20" />
          <CardContent className="p-10 text-center flex flex-col items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-32 h-32 rounded-full bg-secondary/10 hover:bg-secondary/20 mb-8 transition-all hover:scale-110 active:scale-95 group"
              onClick={playAudio}
            >
              <Volume2 size={64} className="text-secondary group-hover:animate-pulse" />
            </Button>
            <h2 className="text-2xl font-bold mb-2">Dengarkan dan Tebak</h2>
            <p className="text-sm text-foreground/60 italic leading-relaxed">
              Tekan tombol suara di atas untuk mendengar nada karakter Mandarin.
            </p>
          </CardContent>
        </Card>

        {/* Options Grid */}
        <AnimatePresence mode="wait">
          {status === "playing" ? (
            <motion.div 
              key="options"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-2 gap-4 w-full"
            >
              {[1, 2, 3, 4].map((t) => {
                const marks = ["—", "／", "∨", "＼"];
                return (
                  <Button
                    key={t}
                    variant="outline"
                    className="h-24 text-lg font-bold glass flex flex-col items-center justify-center gap-1 hover:border-secondary transition-all hover:bg-secondary/5"
                    onClick={() => handleAnswer(t - 1)}
                  >
                    <span className="text-3xl text-secondary">{marks[t-1]}</span>
                    <span className="text-xs font-bold uppercase text-foreground/40 tracking-tighter">Nada {t}</span>
                  </Button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`w-full p-6 rounded-2xl border-2 flex flex-col items-center text-center ${status === "correct" ? "bg-green-500/10 border-green-500/50" : "bg-red-500/10 border-red-500/50"}`}
            >
              {status === "correct" ? (
                <CheckCircle2 size={48} className="text-green-500 mb-4" />
              ) : (
                <XCircle size={48} className="text-red-500 mb-4" />
              )}
              
              <h3 className={`text-2xl font-bold mb-2 ${status === "correct" ? "text-green-500" : "text-red-500"}`}>
                {status === "correct" ? "Benar Sekali!" : "Masih Kurang Tepat"}
              </h3>

              <div className="flex items-center gap-4 mb-4 bg-background/50 p-4 rounded-xl border border-foreground/5">
                <span className="text-5xl font-bold">{q.char}</span>
                <div className="text-left">
                  <p className="text-3xl font-bold text-secondary leading-none">{q.pinyin}</p>
                  <p className="text-sm text-foreground/50">{q.meaning}</p>
                </div>
              </div>

              <p className="text-sm text-foreground/70 mb-6 px-4">
                {status === "correct" 
                  ? `Karakter "${q.char}" dibaca "${q.pinyin}" dengan ${q.name} (${q.mark}).`
                  : `Hati-hati! Tadi adalah ${q.name} (${q.mark}). Perhatikan suara yang ${q.tone === 4 ? "menghunjam turun" : q.tone === 2 ? "naik seperti bertanya" : q.tone === 3 ? "melengkung rendah" : "datar tinggi"}.`
                }
              </p>

              {status === "correct" ? (
                <Button className="w-full font-bold h-14 text-lg" variant="dragon" onClick={nextQuestion}>
                  Lanjut ke Soal Berikutnya
                </Button>
              ) : (
                <Button className="w-full font-bold h-14 text-lg bg-red-500 hover:bg-red-600 text-white border-none" onClick={retryQuestion}>
                  <RefreshCcw className="mr-2" size={18} /> Coba Lagi
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

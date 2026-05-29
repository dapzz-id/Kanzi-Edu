"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Trophy, Timer, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface Question {
  char: string;
  options: string[];
  correct: string;
}

function MatchUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const path = (searchParams.get("path") || "samurai") as "samurai" | "dragon";
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch("/api/generate-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path, count: 10 }),
        });
        const data = await res.json();
        if (data.success) {
          setQuestions(data.questions);
        } else {
          console.error("Failed to fetch questions", data.error);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [path]);

  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0) {
      setGameOver(true);
    }
  }, [timeLeft, gameOver]);

  const handleAnswer = (answer: string) => {
    if (feedback) return;
    setSelectedAnswer(answer);

    const isCorrect = answer === questions[currentQ].correct;

    if (isCorrect) {
      setScore(score + 10);
      setFeedback("correct");
    } else {
      setFeedback("wrong");
    }
    
    setTimeout(() => {
      setFeedback(null);
      setSelectedAnswer(null);
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
      } else {
        setGameOver(true);
      }
    }, isCorrect ? 800 : 1500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const themeColor = path === "samurai" ? "text-primary" : "text-secondary";
  const themeBg = path === "samurai" ? "bg-primary" : "bg-secondary";

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background gap-4">
        <Loader2 className={`animate-spin ${themeColor}`} size={64} />
        <h2 className="text-xl font-bold animate-pulse">AI sedang meracik materi belajar...</h2>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <h2>Gagal memuat pertanyaan.</h2>
        <Button onClick={() => window.location.reload()} className="mt-4">Coba Lagi</Button>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center w-full max-w-sm">
          <Card className={`glass border-${path === 'samurai' ? 'primary' : 'secondary'}/50 overflow-hidden`}>
            <CardContent className="p-6 md:p-10">
              <Trophy size={60} className="mx-auto mb-6 text-yellow-500" />
              <h1 className="text-2xl md:text-3xl font-black mb-2 uppercase italic">SELESAI!</h1>
              <div className="bg-foreground/5 rounded-3xl p-6 mb-8 mt-6">
                <p className="text-xs opacity-50 font-bold uppercase tracking-widest mb-1">Skor Akhir</p>
                <p className={`text-5xl font-black ${themeColor}`}>{score}</p>
              </div>
              <Button size="lg" className={`w-full mb-4 h-14 rounded-2xl font-bold ${themeBg} text-white shadow-xl active:scale-95 transition-transform`} onClick={() => window.location.reload()}>Main Lagi</Button>
              <Button size="lg" variant="ghost" className="w-full h-14 rounded-2xl font-bold" onClick={() => router.push("/dashboard")}>Dashboard</Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="min-h-screen flex flex-col p-4 bg-gradient-to-b from-[#0a0a0a] to-background relative overflow-hidden">
      {/* Top HUD */}
      <div className="flex justify-between items-center max-w-2xl mx-auto w-full mb-8 z-10 pt-2">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} className="hover:bg-white/5 rounded-full h-10 w-10">
          <ArrowLeft size={20} />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-xs bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <Trophy className="text-yellow-500" size={14} /> {score}
          </div>
          <div className={`flex items-center gap-2 font-bold text-xs px-3 py-1.5 rounded-full border border-white/10 ${timeLeft <= 10 ? 'bg-red-500/20 text-red-500' : 'bg-white/5'}`}>
            <Timer size={14} /> {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Arena Content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full z-10 px-2">
        <div className="text-[10px] font-black opacity-20 mb-4 tracking-[0.4em] uppercase">Soal {currentQ + 1} / 10</div>
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentQ} 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 1.1, opacity: 0 }}
            className="mb-8 md:mb-12 relative w-full flex justify-center"
          >
            <div className={`w-48 h-48 md:w-64 md:h-64 rounded-[2.5rem] md:rounded-[3.5rem] bg-white/5 border-2 border-white/10 flex items-center justify-center shadow-2xl glass transition-colors duration-300 p-6 ${feedback === 'correct' ? 'border-green-500/50 bg-green-500/5' : feedback === 'wrong' ? 'border-red-500/50 bg-red-500/5' : ''}`}>
              <span className={`font-black ${themeColor} drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] text-center whitespace-nowrap leading-none ${
                q.char.length >= 4 ? "text-2xl md:text-4xl" : 
                q.char.length >= 2 ? "text-4xl md:text-6xl" : 
                "text-7xl md:text-9xl"
              }`}>
                {q.char}
              </span>
            </div>

            {feedback && (
              <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} className="absolute -top-4 -right-4 bg-background border-2 border-white/10 p-3 rounded-full shadow-2xl z-20">
                {feedback === 'correct' ? <CheckCircle2 className="text-green-500" size={28} /> : <XCircle className="text-red-500" size={28} />}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-3 w-full">
          {q.options.map((opt, i) => {
            const isCorrect = opt === q.correct;
            const isSelected = selectedAnswer === opt;
            
            let btnClass = "w-full h-16 md:h-20 text-sm md:text-lg font-black transition-all border-white/10 rounded-2xl uppercase active:scale-95";
            
            if (feedback) {
              if (isCorrect) {
                btnClass += " !bg-green-600 !text-white !opacity-100 border-none shadow-[0_0_20px_rgba(34,197,94,0.6)] z-10 scale-105";
              } else if (isSelected && !isCorrect) {
                btnClass += " !bg-red-600 !text-white !opacity-100 border-none";
              } else {
                btnClass += " opacity-10 scale-95 gray-scale";
              }
            } else {
              btnClass += " glass bg-white/5 hover:" + themeBg + " hover:text-white";
            }

            return (
              <motion.div key={i} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}>
                <Button 
                  variant="outline" 
                  className={btnClass}
                  onClick={() => handleAnswer(opt)}
                  disabled={!!feedback}
                >
                  {opt}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function MatchUpGame() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    }>
      <MatchUpContent />
    </Suspense>
  );
}



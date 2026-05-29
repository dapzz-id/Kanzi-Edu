"use client";

import { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Swords, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, deleteDoc, getDoc } from "firebase/firestore";

interface PvPQuestion {
  char: string;
  correct: string;
  options: string[];
}

interface MatchData {
  player1: { uid: string; name: string; hp: number; currentAnswer?: string; score: number };
  player2: { uid: string; name: string; hp: number; currentAnswer?: string; score: number };
  questions: PvPQuestion[];
  path: "samurai" | "dragon";
  currentQuestionIndex: number;
  status: "waiting" | "playing" | "finished";
}

export default function PvPArena({ params }: { params: Promise<{ matchId: string }> }) {
  const resolvedParams = use(params);
  const matchId = resolvedParams.matchId;
  const router = useRouter();
  
  const [match, setMatch] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isPlayer1, setIsPlayer1] = useState(false);
  const [myAnswered, setMyAnswered] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.push("/login");
      return;
    }

    const unsubscribe = onSnapshot(doc(db, "matches", matchId), (snapshot) => {
      if (!snapshot.exists()) {
        router.push("/pvp");
        return;
      }

      const data = snapshot.data() as MatchData;
      setMatch(data);
      setLoading(false);
      setIsPlayer1(data.player1.uid === user.uid);

      // Sinkronisasi status jawaban
      const amI1 = data.player1.uid === user.uid;
      const myAnswer = amI1 ? data.player1.currentAnswer : data.player2.currentAnswer;
      const oppAnswer = amI1 ? data.player2.currentAnswer : data.player1.currentAnswer;

      setMyAnswered(!!myAnswer);

      // Jika keduanya sudah menjawab, evaluasi!
      if (myAnswer && oppAnswer && !showResult) {
        evaluateTurn(data, amI1);
      }
    });

    return () => unsubscribe();
  }, [matchId, router, showResult]);

  // Efek untuk menangani akhir pertandingan (Pemberian XP & Rank)
  useEffect(() => {
    if (match?.status === "finished" && auth.currentUser) {
      const updateXP = async () => {
        const user = auth.currentUser!;
        const myData = isPlayer1 ? match.player1 : match.player2;
        const oppData = isPlayer1 ? match.player2 : match.player1;
        
        // Tentukan jika saya pemenangnya
        const iWon = myData.hp > oppData.hp || (myData.hp === oppData.hp && myData.score > oppData.score);
        
        if (iWon) {
          try {
            const userRef = doc(db, "users", user.uid);
            const snap = await getDoc(userRef);
            if (snap.exists()) {
              const currentXP = snap.data().xp || 0;
              const newXP = currentXP + 50; // Bonus besar untuk pemenang PvP
              
              let newRank = "Warrior";
              if (newXP >= 600) newRank = "Grandmaster";
              else if (newXP >= 300) newRank = "Master";
              else if (newXP >= 100) newRank = "Elite";

              // Mencatat log XP harian
              const todayStr = new Date().toISOString().split("T")[0];
              const currentHistory = snap.data().historyXP || {};
              const todayXP = currentHistory[todayStr] || 0;

              await updateDoc(userRef, { 
                xp: newXP, 
                rank: newRank,
                historyXP: {
                  ...currentHistory,
                  [todayStr]: todayXP + 50
                }
              });
            }
          } catch (err) {
            console.error("Gagal memperbarui XP PvP:", err);
          }
        }
      };
      updateXP();
    }
  }, [match?.status]);

  const evaluateTurn = async (data: MatchData, amI1: boolean) => {
    setShowResult(true);
    
    // Tunggu sebentar agar pemain bisa melihat jawaban mereka
    setTimeout(async () => {
      // Hanya Player 1 yang melakukan update state kuis untuk sinkronisasi (mencegah race conditions)
      if (amI1) {
        const q = data.questions[data.currentQuestionIndex];
        let p1HP = data.player1.hp;
        let p2HP = data.player2.hp;
        let p1Score = data.player1.score;
        let p2Score = data.player2.score;

        if (data.player1.currentAnswer !== q.correct) p1HP -= 10; else p1Score += 10;
        if (data.player2.currentAnswer !== q.correct) p2HP -= 10; else p2Score += 10;

        const isGameOver = p1HP <= 0 || p2HP <= 0 || data.currentQuestionIndex >= 9;

        await updateDoc(doc(db, "matches", matchId), {
          "player1.hp": Math.max(0, p1HP),
          "player2.hp": Math.max(0, p2HP),
          "player1.score": p1Score,
          "player2.score": p2Score,
          "player1.currentAnswer": null, // Reset untuk ronde berikutnya
          "player2.currentAnswer": null,
          currentQuestionIndex: isGameOver ? data.currentQuestionIndex : data.currentQuestionIndex + 1,
          status: isGameOver ? "finished" : "playing"
        });
      }
      
      setShowResult(false);
      setSelectedAnswer(null);
      setMyAnswered(false);
    }, 2000);
  };

  const handleAnswer = async (answer: string) => {
    if (myAnswered || showResult || !match) return;
    setSelectedAnswer(answer);
    
    const field = isPlayer1 ? "player1.currentAnswer" : "player2.currentAnswer";
    await updateDoc(doc(db, "matches", matchId), { [field]: answer });
  };

  if (loading || !match) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-red-500" size={48} />
      </div>
    );
  }

  const isGameOver = match.status === "finished";
  const myData = isPlayer1 ? match.player1 : match.player2;
  const oppData = isPlayer1 ? match.player2 : match.player1;
  const currentQ = match.questions[match.currentQuestionIndex];

  if (isGameOver) {
    const iWon = myData.hp > oppData.hp || (myData.hp === oppData.hp && myData.score > oppData.score);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <h1 className={`text-6xl font-black mb-4 ${iWon ? "text-yellow-500" : "text-red-500"}`}>
            {iWon ? "VICTORY!" : "DEFEAT"}
          </h1>
          <div className="bg-foreground/5 p-6 rounded-2xl mb-8">
            <p className="text-2xl font-bold mb-2">Skor Akhir</p>
            <div className="flex justify-between gap-12">
              <div>
                <p className="text-sm opacity-50">Kamu</p>
                <p className="text-3xl font-bold">{myData.score}</p>
              </div>
              <div className="text-foreground/20 text-3xl font-bold">VS</div>
              <div>
                <p className="text-sm opacity-50">Lawan</p>
                <p className="text-3xl font-bold">{oppData.score}</p>
              </div>
            </div>
          </div>
          <Button size="lg" className="w-full mb-4" variant="dragon" onClick={() => router.push("/pvp")}>Cari Lawan Baru</Button>
          <Button size="lg" variant="ghost" className="w-full" onClick={() => router.push("/dashboard")}>Dashboard</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 bg-gradient-to-br from-[#1a0505] via-background to-[#1a1a05] relative overflow-hidden">
      
      {/* HUD Bar */}
      <div className="max-w-4xl mx-auto w-full flex justify-between items-center gap-4 md:gap-8 py-4 md:py-8 px-2 md:px-4 z-20">
        <div className="flex-1">
          <p className="text-[10px] md:text-xs font-bold text-blue-400 mb-1 uppercase">KAMU</p>
          <div className="h-2 md:h-3 bg-foreground/10 rounded-full overflow-hidden border border-white/5">
            <motion.div className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" animate={{ width: `${myData.hp}%` }} />
          </div>
          <p className="text-[9px] md:text-[10px] mt-1 opacity-50 font-mono">{myData.score} XP</p>
        </div>

        <div className="text-red-500 font-black text-lg md:text-2xl italic tracking-tighter px-2">VS</div>

        <div className="flex-1 text-right">
          <p className="text-[10px] md:text-xs font-bold text-red-500 mb-1 uppercase">LAWAN</p>
          <div className="h-2 md:h-3 bg-foreground/10 rounded-full overflow-hidden border border-white/5 flex justify-end">
            <motion.div className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" animate={{ width: `${oppData.hp}%` }} />
          </div>
          <p className="text-[9px] md:text-[10px] mt-1 opacity-50 font-mono">{oppData.score} XP</p>
        </div>
      </div>

      {/* Main Arena */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full z-10 px-2 md:px-4 mt-2 md:mt-0">
        
        {/* Question Area */}
        <div className="w-full text-center mb-8 md:mb-12">
          <div className="text-[10px] md:text-xs font-bold opacity-30 mb-2 md:mb-4 tracking-[0.3em] uppercase">SOAL {match.currentQuestionIndex + 1} / 10</div>
          <AnimatePresence mode="wait">
            <motion.div
              key={match.currentQuestionIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden glass"
            >
              <h2 className="text-5xl md:text-8xl font-black mb-2 md:mb-4 drop-shadow-2xl">{currentQ.char}</h2>
              <p className="text-[10px] md:text-xs text-foreground/40 uppercase tracking-widest font-bold">Pilih arti yang tepat!</p>

              {myAnswered && !showResult && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-20">
                  <Loader2 className="animate-spin text-white mb-4" size={32} />
                  <p className="font-black text-white uppercase tracking-[0.2em] text-sm md:text-base italic">Menunggu Lawan...</p>
                </div>
              )}
              
              {showResult && (
                <motion.div 
                  initial={{ opacity: 0, scale: 1.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`absolute inset-0 backdrop-blur-md flex flex-col items-center justify-center z-20 ${selectedAnswer === currentQ.correct ? "bg-green-500/30" : "bg-red-500/30"}`}
                >
                   {selectedAnswer === currentQ.correct ? <CheckCircle2 className="text-green-400 mb-2" size={48} /> : <XCircle className="text-red-400 mb-2" size={48} />}
                   <p className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">{selectedAnswer === currentQ.correct ? "TEPAT!" : "SALAH!"}</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 w-full">
          {currentQ.options.map((opt, i) => {
            const isCorrect = opt === currentQ.correct;
            const isSelected = selectedAnswer === opt;
            
            let variant: "outline" | "default" | "samurai" | "dragon" | "ghost" | "destructive" = "outline";
            let className = "h-16 md:h-24 text-sm md:text-xl font-black border-white/10 transition-all uppercase tracking-tight";

            if (showResult) {
              if (isCorrect) {
                variant = match.path === "samurai" ? "samurai" : "dragon";
                className += " ring-4 ring-green-500/50 scale-105 z-10 shadow-[0_0_20px_rgba(34,197,94,0.4)]";
              } else if (isSelected && !isCorrect) {
                className += " bg-red-600 text-white border-none opacity-100 shadow-[0_0_20px_rgba(220,38,38,0.4)]";
              } else {
                className += " opacity-20 scale-95";
              }
            } else if (isSelected) {
              variant = "default";
              className += " scale-95 opacity-80";
            } else {
              className += " hover:scale-[1.02] active:scale-95 bg-white/5";
            }

            return (
              <Button
                key={i}
                variant={variant as any}
                className={className}
                onClick={() => handleAnswer(opt)}
                disabled={myAnswered || showResult}
              >
                {opt}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

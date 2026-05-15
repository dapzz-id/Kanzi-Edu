"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { use } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

interface MultipleChoice {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
}

interface Essay {
  text: string;
}

interface QuizData {
  multipleChoice: MultipleChoice[];
  essay: Essay;
}

const SKILL_LABELS = ["Angka Dasar", "Salam & Sapaan", "Keluarga", "Waktu & Hari", "Makanan & Minuman", "Arah & Lokasi"];

export default function QuizPage({ params }: { params: Promise<{ level: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const path = (searchParams.get("path") || "samurai") as "samurai" | "dragon";
  
  const level = parseInt(resolvedParams.level) || 1;
  const moduleName = SKILL_LABELS[level - 1] || "Modul Rahasia";
  const isSamurai = path === "samurai";
  const themeClass = isSamurai ? "text-primary" : "text-secondary";

  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  
  // States for Multiple Choice
  const [currentMC, setCurrentMC] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  // States for Essay
  const [essayAnswer, setEssayAnswer] = useState("");
  const [validating, setValidating] = useState(false);
  const [essayFeedback, setEssayFeedback] = useState<{ isCorrect: boolean; feedback: string } | null>(null);
  const [savingProgress, setSavingProgress] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);

  // Simpan progres setelah kuis selesai (selalu, terlepas dari skor esai)
  const saveProgress = async () => {
    setSavingProgress(true);
    const nextLevel = level + 1;
    const user = auth.currentUser;
    
    // Key sekarang menyertakan UID agar unik per akun
    const localLevelKey = user ? `kanzi_level_${user.uid}_${path}` : `kanzi_level_guest_${path}`;
    const firestoreField = path === "samurai" ? "levelSamurai" : "levelDragon";

    // 1. Simpan ke localStorage sebagai fallback yang selalu berhasil
    const currentLocalLevel = parseInt(localStorage.getItem(localLevelKey) || "1");
    if (level >= currentLocalLevel) {
      localStorage.setItem(localLevelKey, String(nextLevel));
    }

    // 2. Coba simpan ke Firestore
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        
        let updateData: any = {};
        
        // Update level jika lebih tinggi
        const currentLevel = snap.exists() ? (snap.data()[firestoreField] || 1) : 1;
        if (level >= currentLevel) {
          updateData[firestoreField] = nextLevel;
        }

        // Update XP (+20 XP per kuis selesai)
        const currentXP = snap.exists() ? (snap.data().xp || 0) : 0;
        const newXP = currentXP + 20;
        updateData.xp = newXP;

        // Update Rank secara dinamis
        let newRank = "Warrior";
        if (newXP >= 600) newRank = "Grandmaster";
        else if (newXP >= 300) newRank = "Master";
        else if (newXP >= 100) newRank = "Elite";
        updateData.rank = newRank;

        await updateDoc(userRef, updateData);
      } catch (err) {
        console.warn("Firestore tidak tersedia, progres hanya disimpan lokal:", err);
      }
    }

    setSavingProgress(false);
    setProgressSaved(true);
  };

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch("/api/generate-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path, moduleLevel: level, moduleName })
        });
        const json = await res.json();
        if (json.success) {
          setQuizData(json.data);
        } else {
          console.error("AI Generation Error:", json.error);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [level, moduleName, path]);

  const handleOptionClick = (optionStr: string) => {
    if (selectedOption !== null) return; // prevent multiple clicks
    setSelectedOption(optionStr);
    
    // Extract A/B/C/D/E
    const letter = optionStr.charAt(0);
    if (quizData && letter === quizData.multipleChoice[currentMC].correctAnswer) {
      setScore((s) => s + 1);
    }

    setTimeout(() => {
      setSelectedOption(null);
      setCurrentMC((prev) => prev + 1);
    }, 1000);
  };

  const handleEssaySubmit = async () => {
    if (!essayAnswer.trim() || !quizData) return;
    setValidating(true);
    try {
      const res = await fetch("/api/validate-essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: quizData.essay.text, answer: essayAnswer, path })
      });
      const json = await res.json();
      if (json.success) {
        setEssayFeedback(json.data);
        // Simpan progres setelah kuis selesai, terlepas dari apakah esai benar atau salah
        saveProgress();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setValidating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <Loader2 className={`animate-spin mb-4 ${themeClass}`} size={48} />
        <p className="text-foreground/70 animate-pulse">Gemini sedang meracik soal ujian akhirmu...</p>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <p>Gagal memuat kuis.</p>
        <Button className="mt-4" onClick={() => router.push("/dashboard")}>Kembali</Button>
      </div>
    );
  }

  const isEssayPhase = currentMC >= quizData.multipleChoice.length;

  // Render Multiple Choice
  if (!isEssayPhase) {
    const q = quizData.multipleChoice[currentMC];
    return (
      <div className="min-h-screen flex flex-col p-4 md:p-6 bg-gradient-to-b from-background to-background/50 items-center justify-center">
        <div className="w-full max-w-xl">
          <div className="text-[10px] md:text-sm text-foreground/50 mb-2 md:mb-4 font-bold uppercase tracking-widest">
            Soal {currentMC + 1} / {quizData.multipleChoice.length}
          </div>
          <Card className="glass border-t-4 border-t-primary w-full shadow-2xl">
            <CardHeader className="p-5 md:p-6">
              <CardTitle className="text-xl md:text-2xl leading-relaxed">{q.text}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4 p-5 md:p-6 pt-0 md:pt-0">
              {q.options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                const letter = opt.charAt(0);
                const isCorrect = letter === q.correctAnswer;
                
                let btnVariant: "outline" | "default" | "samurai" | "dragon" | "ghost" = "outline";
                if (selectedOption !== null) {
                  if (isCorrect) btnVariant = "default";
                  else btnVariant = "outline";
                }

                return (
                  <Button
                    key={idx}
                    variant={btnVariant}
                    className={`w-full justify-start text-left h-auto py-3 md:py-4 px-4 md:px-6 text-base md:text-lg transition-all active:scale-[0.98] ${isSelected && isCorrect ? "bg-green-600 hover:bg-green-700 text-white border-none shadow-lg" : ""} ${isSelected && !isCorrect ? "bg-red-500 hover:bg-red-600 text-white border-none shadow-lg" : ""}`}
                    onClick={() => handleOptionClick(opt)}
                    disabled={selectedOption !== null}
                  >
                    {opt}
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render Essay
  if (isEssayPhase && !essayFeedback) {
    return (
      <div className="min-h-screen flex flex-col p-4 md:p-6 bg-gradient-to-b from-background to-background/50 items-center justify-center">
        <div className="w-full max-w-xl">
          <div className="text-[10px] md:text-sm text-foreground/50 mb-2 md:mb-4 font-bold uppercase tracking-widest">
            Ujian Esai Akhir
          </div>
          <Card className="glass border-t-4 border-t-amber-500 w-full shadow-2xl">
            <CardHeader className="p-5 md:p-6">
              <CardTitle className="text-xl md:text-2xl leading-relaxed">{quizData.essay.text}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6 p-5 md:p-6 pt-0 md:pt-0">
              <Textarea 
                placeholder="Ketik jawabanmu di sini (gunakan Romaji/Pinyin/Indonesia)..." 
                className="min-h-[120px] md:min-h-[150px] text-base md:text-lg p-3 md:p-4 bg-background/50"
                value={essayAnswer}
                onChange={(e) => setEssayAnswer(e.target.value)}
                disabled={validating}
              />
              <Button 
                size="lg" 
                className="w-full font-bold text-base md:text-lg py-6 shadow-lg" 
                variant={isSamurai ? "samurai" : "dragon"}
                onClick={handleEssaySubmit}
                disabled={validating || !essayAnswer.trim()}
              >
                {validating ? <><Loader2 className="mr-2 animate-spin" /> Mengevaluasi...</> : "Serahkan Jawaban"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render Result
  if (essayFeedback) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 bg-background">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-xl w-full">
          {/* Ikon utama berdasarkan skor */}
          {score >= Math.ceil((quizData?.multipleChoice.length || 5) / 2) ? (
            <CheckCircle2 size={80} className="mx-auto mb-4 md:mb-6 text-green-500 md:w-24 md:h-24" />
          ) : (
            <XCircle size={80} className="mx-auto mb-4 md:mb-6 text-orange-400 md:w-24 md:h-24" />
          )}

          <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">
            {essayFeedback.isCorrect ? "Luar Biasa!" : "Terus Semangat!"}
          </h1>
          <p className="text-base md:text-xl text-foreground/70 mb-4 md:mb-6">
            Skor Pilihan Ganda: {score} / {quizData?.multipleChoice.length}
          </p>

          {/* Status simpan progres — selalu ditampilkan */}
          <div className={`flex items-center justify-center gap-2 mb-6 md:mb-8 text-xs md:text-sm font-semibold ${savingProgress ? "text-foreground/50" : progressSaved ? "text-green-500" : "text-foreground/50"}`}>
            {savingProgress ? (
              <><Loader2 size={14} className="animate-spin" /> Menyimpan progres...</>
            ) : progressSaved ? (
              <><CheckCircle2 size={14} /> Modul berikutnya terbuka!</>
            ) : null}
          </div>

          <Card className="glass text-left mb-6 md:mb-8 shadow-lg">
            <CardHeader className="p-4 md:p-6 pb-2 md:pb-3">
              <CardTitle className="text-base md:text-lg opacity-60">Ulasan Guru (Gemini AI):</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
              <p className="text-base md:text-lg leading-relaxed text-foreground/80 italic">&quot;{essayFeedback.feedback}&quot;</p>
            </CardContent>
          </Card>

          <Button size="lg" variant={isSamurai ? "samurai" : "dragon"} className="w-full text-base md:text-lg py-6 shadow-xl" onClick={() => router.push("/dashboard")}>
            Kembali ke Dashboard <ArrowRight className="ml-2" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return null;
}

"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, ArrowRight, ArrowLeft, Loader2, BookA, PenTool, Swords, Lightbulb, Globe } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { use } from "react";

interface Vocabulary {
  char: string;
  reading: string;
  meaning: string;
  example?: string;
  exampleReading?: string;
  exampleMeaning?: string;
}

interface Character {
  char: string;
  type: string;
  strokeCount?: number;
  strokeOrder: string;
  mnemonicTip?: string;
}

interface ModuleData {
  title: string;
  description: string;
  vocabulary: Vocabulary[];
  characters: Character[];
  culturalNote?: string;
  quest: string;
}

const SKILL_LABELS = ["Angka Dasar", "Salam & Sapaan", "Keluarga", "Waktu & Hari", "Makanan & Minuman", "Arah & Lokasi"];

function LearnContent({ params }: { params: Promise<{ level: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const path = (searchParams.get("path") || "samurai") as "samurai" | "dragon";

  const level = parseInt(resolvedParams.level) || 1;
  const moduleName = SKILL_LABELS[level - 1] || "Modul Rahasia";
  const isSamurai = path === "samurai";
  const themeClass = isSamurai ? "text-primary" : "text-secondary";
  const themeBorder = isSamurai ? "border-primary" : "border-secondary";
  const themeBg = isSamurai ? "bg-primary" : "bg-secondary";

  const [loading, setLoading] = useState(true);
  const [moduleData, setModuleData] = useState<ModuleData | null>(null);
  const [activeTab, setActiveTab] = useState<"vocab" | "char" | "quest">("vocab");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    // Cek localStorage cache dulu sebelum hit server
    const localCacheKey = `kanzi_module_${path}_${level}`;
    const cached = localStorage.getItem(localCacheKey);
    if (cached) {
      try {
        setModuleData(JSON.parse(cached));
        setLoading(false);
        return;
      } catch { /* invalid cache, lanjut fetch */ }
    }

    const fetchModule = async () => {
      try {
        const res = await fetch("/api/generate-module", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path, moduleLevel: level, moduleName })
        });
        const json = await res.json();
        if (json.success) {
          setModuleData(json.data);
          // Simpan ke localStorage untuk akses berikutnya (instant)
          localStorage.setItem(localCacheKey, JSON.stringify(json.data));
        } else {
          console.error("AI Generation Error:", json.error);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchModule();
  }, [level, moduleName, path]);

  const playAudio = (text: string, lang: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <Loader2 className={`animate-spin mb-4 ${themeClass}`} size={48} />
        <p className="text-foreground/70 animate-pulse">AI sedang menyusun kurikulum eksklusif untukmu...</p>
      </div>
    );
  }

  if (!moduleData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <p className="text-foreground/70 mb-4">Gagal memuat materi. Pastikan API Key Gemini sudah diatur.</p>
        <Button onClick={() => router.push("/dashboard")}>Kembali</Button>
      </div>
    );
  }

  const vocabList = moduleData.vocabulary;
  const currentCard = vocabList[currentIndex];

  return (
    <div className="min-h-screen flex flex-col p-4 bg-gradient-to-b from-background to-background/50">
      {/* Top Bar */}
      <div className="flex justify-between items-center max-w-4xl mx-auto w-full mt-2 md:mt-4 mb-4 md:mb-6 px-2">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} className="h-9 w-9 md:h-10 md:w-10">
          <ArrowLeft size={18} />
        </Button>
        <div className="text-center flex-1 px-2">
          <h1 className={`text-lg md:text-2xl font-bold leading-tight ${themeClass}`}>{moduleData.title}</h1>
          <p className="text-[10px] md:text-sm text-foreground/60 mt-0.5 hidden md:block">{moduleData.description}</p>
        </div>
        <div className="w-9 md:w-10"></div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto w-full flex bg-foreground/5 p-1 rounded-full mb-6">
        {([["vocab", "Kosakata", BookA], ["char", "Aksara & Goresan", PenTool], ["quest", "Misi Utama", Swords]] as const).map(([tab, label, Icon]) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 rounded-full text-xs md:text-sm font-bold flex items-center justify-center gap-1 md:gap-2 transition-all ${activeTab === tab ? `${themeBg} text-white shadow-md` : "text-foreground/60 hover:text-foreground"}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Cultural Note Banner */}
      {moduleData.culturalNote && (
        <div className="max-w-4xl mx-auto w-full mb-6">
          <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <Globe size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/80 italic">{moduleData.culturalNote}</p>
          </div>
        </div>
      )}

      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col items-center">

        {/* ─── Tab: Kosakata ─────────────────────────────────────────── */}
        {activeTab === "vocab" && (
          <div className="w-full space-y-6">
            {/* Flashcard */}
            <div className="w-full max-w-sm mx-auto px-4 md:px-0">
              <div className="text-[10px] md:text-sm font-semibold text-foreground/50 mb-2 md:mb-3 text-center uppercase tracking-widest">
                Kartu {currentIndex + 1} / {vocabList.length}
              </div>
              <div className="relative h-64 md:h-80 perspective-1000">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex + (isFlipped ? "-b" : "-f")}
                    initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    <Card className={`w-full h-full flex flex-col items-center justify-center text-center glass border-2 shadow-xl ${isSamurai ? "border-primary/20" : "border-secondary/20"}`}>
                      <CardContent className="p-4 md:p-6">
                        {!isFlipped ? (
                          <>
                            <p className="text-6xl md:text-8xl font-bold mb-4 select-none tracking-tighter">{currentCard.char}</p>
                            <p className="text-foreground/40 text-[10px] md:text-xs uppercase font-bold tracking-widest">Ketuk untuk arti</p>
                          </>
                        ) : (
                          <>
                            <p className={`text-2xl md:text-4xl font-bold mb-1 md:mb-2 ${themeClass}`}>{currentCard.reading}</p>
                            <p className="text-lg md:text-2xl font-medium text-foreground/80 mb-2 md:mb-4">&quot;{currentCard.meaning}&quot;</p>
                            {currentCard.example && (
                              <div className="border-t border-foreground/10 pt-2 md:pt-4 mt-2 md:mt-4">
                                <p className="text-xs md:text-base font-medium leading-tight">{currentCard.example}</p>
                                <p className="text-[10px] md:text-sm text-foreground/50 mt-0.5">{currentCard.exampleReading}</p>
                                <p className="text-[10px] md:text-sm text-foreground/70 mt-1.5 italic font-serif opacity-80 leading-relaxed">&quot;{currentCard.exampleMeaning}&quot;</p>
                              </div>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatePresence>
              </div>
              {/* Controls */}
              <div className="flex justify-between items-center mt-6">
                <Button variant="outline" size="icon" className="rounded-full h-10 w-10 md:h-12 md:w-12 shadow-sm" onClick={() => { setIsFlipped(false); if (currentIndex > 0) setCurrentIndex(i => i - 1); }} disabled={currentIndex === 0}>
                  <ArrowLeft size={20} />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full w-16 h-16 md:w-20 md:h-20 bg-foreground/5 hover:bg-foreground/10 transition-colors shadow-inner" onClick={() => playAudio(currentCard.char, isSamurai ? "ja-JP" : "zh-CN")}>
                  <Volume2 size={32} className={themeClass} />
                </Button>
                <Button variant={isSamurai ? "samurai" : "dragon"} size="icon" className="rounded-full h-10 w-10 md:h-12 md:w-12 shadow-lg" onClick={() => { setIsFlipped(false); if (currentIndex < vocabList.length - 1) setCurrentIndex(i => i + 1); else setActiveTab("char"); }}>
                  <ArrowRight size={20} />
                </Button>
              </div>
            </div>

            {/* Daftar semua vocabulary */}
            <div>
              <h3 className="font-bold text-sm text-foreground/50 uppercase tracking-wider mb-3">Semua Kosakata ({vocabList.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {vocabList.map((v, i) => (
                  <Card key={i} className={`glass cursor-pointer border transition-all ${currentIndex === i ? `${themeBorder} border-2` : "border-foreground/10"}`} onClick={() => { setCurrentIndex(i); setIsFlipped(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold">{v.char}</span>
                        <div>
                          <p className={`font-semibold text-sm ${themeClass}`}>{v.reading}</p>
                          <p className="text-sm text-foreground/70">{v.meaning}</p>
                        </div>
                      </div>
                      {v.example && <p className="text-xs text-foreground/50 mt-2 border-t border-foreground/5 pt-2 italic">{v.example} — {v.exampleMeaning}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Tab: Aksara & Goresan ────────────────────────────────── */}
        {activeTab === "char" && (
          <div className="w-full space-y-4">
            {moduleData.characters.map((char, idx) => (
              <Card key={idx} className="glass">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-5xl font-bold">{char.char}</span>
                      <div>
                        <span className="text-xs uppercase bg-foreground/10 px-2 py-1 rounded-full">{char.type}</span>
                        {char.strokeCount && <p className="text-xs text-foreground/50 mt-1">{char.strokeCount} goresan</p>}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => playAudio(char.char, isSamurai ? "ja-JP" : "zh-CN")}>
                      <Volume2 size={18} className={themeClass} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-bold uppercase text-foreground/40 mb-2">Tata Cara Penulisan</p>
                    <p className={`text-sm text-foreground/80 leading-relaxed border-l-4 ${themeBorder} pl-4`}>{char.strokeOrder}</p>
                  </div>
                  {char.mnemonicTip && (
                    <div className="flex items-start gap-2 bg-amber-500/10 rounded-lg p-3">
                      <Lightbulb size={16} className="text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground/70 italic">{char.mnemonicTip}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            <div className="flex justify-center pt-2">
              <Button variant={isSamurai ? "samurai" : "dragon"} onClick={() => setActiveTab("quest")}>
                Lanjut ke Misi Utama <ArrowRight className="ml-2" size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* ─── Tab: Misi Utama ──────────────────────────────────────── */}
        {activeTab === "quest" && (
          <div className="w-full max-w-lg mx-auto">
            <Card className="glass overflow-hidden border-t-4 border-t-amber-500">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center mb-6">
                  <Swords className="text-amber-500" size={40} />
                </div>
                <CardTitle className="text-2xl mb-4">Misi Kehidupan Nyata</CardTitle>
                <CardDescription className="text-base text-foreground/80 italic mb-8 leading-relaxed">
                  &quot;{moduleData.quest}&quot;
                </CardDescription>
                <Button size="lg" className="w-full font-bold" variant={isSamurai ? "samurai" : "dragon"} onClick={() => router.push(`/quiz/${level}?path=${path}`)}>
                  Saya Siap Ujian Kuis! <ArrowRight className="ml-2" size={18} />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LearnPage({ params }: { params: Promise<{ level: string }> }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    }>
      <LearnContent params={params} />
    </Suspense>
  );
}

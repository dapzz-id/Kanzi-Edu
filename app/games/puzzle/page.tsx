"use client";

import { useState, useEffect, Suspense } from "react";
import { Reorder } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const PUZZLE_DATA = {
  samurai: [
    { words: ["私", "は", "学生", "です"], translation: "Saya adalah murid" },
    { words: ["これ", "は", "本", "です"], translation: "Ini adalah buku" },
    { words: ["寿司", "を", "食べます"], translation: "Makan sushi" },
  ],
  dragon: [
    { words: ["我", "是", "学生"], translation: "Saya adalah murid" },
    { words: ["这", "是", "书"], translation: "Ini adalah buku" },
    { words: ["我", "吃", "米饭"], translation: "Saya makan nasi" },
  ]
};

function PuzzleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const path = (searchParams.get("path") || "samurai") as "samurai" | "dragon";
  const levels = PUZZLE_DATA[path];

  const [level, setLevel] = useState(0);
  const [items, setItems] = useState<string[]>([]);
  const [status, setStatus] = useState<"playing" | "correct" | "wrong">("playing");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setItems([...levels[level].words].sort(() => Math.random() - 0.5));
  }, [level, path]);

  if (!mounted) return null;

  const checkAnswer = () => {
    const isCorrect = items.join("") === levels[level].words.join("");
    if (isCorrect) {
      setStatus("correct");
      setTimeout(() => {
        if (level < levels.length - 1) {
          const nextLevel = level + 1;
          setLevel(nextLevel);
          setItems([...levels[nextLevel].words].sort(() => Math.random() - 0.5));
          setStatus("playing");
        } else {
          router.push("/dashboard");
        }
      }, 1500);
    } else {
      setStatus("wrong");
      setTimeout(() => setStatus("playing"), 1000);
    }
  };

  const themeColor = path === "samurai" ? "text-primary" : "text-secondary";

  return (
    <div className="min-h-screen flex flex-col p-4 bg-background">
      <div className="flex items-center mb-12 max-w-2xl mx-auto w-full">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold mx-auto">Susun Kalimat</h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        <p className="text-foreground/40 uppercase tracking-widest text-xs font-bold mb-2">Target Terjemahan:</p>
        <h2 className={`text-3xl font-black text-center mb-12 ${themeColor}`}>
          {levels[level].translation}
        </h2>

        <Reorder.Group 
          axis="x" 
          values={items} 
          onReorder={setItems} 
          className="flex flex-wrap justify-center gap-3 w-full px-4 mb-12"
        >
          {items.map((item) => (
            <Reorder.Item key={item} value={item}>
              <Card className="cursor-grab active:cursor-grabbing glass border-white/10">
                <CardContent className="p-4 md:p-6 text-center font-bold text-2xl md:text-3xl min-w-[60px]">
                  {item}
                </CardContent>
              </Card>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        <Button 
          size="lg" 
          className={`w-full max-w-xs h-16 text-xl font-black transition-all rounded-full ${status === 'correct' ? 'bg-green-500' : status === 'wrong' ? 'bg-red-500' : (path === 'samurai' ? 'bg-primary' : 'bg-secondary')}`}
          onClick={checkAnswer}
          disabled={status !== "playing"}
        >
          {status === "correct" && <CheckCircle2 className="mr-2" />}
          {status === "wrong" && <XCircle className="mr-2" />}
          {status === "playing" && "PERIKSA JAWABAN"}
          {status === "correct" && "LUAR BIASA!"}
          {status === "wrong" && "COBA LAGI"}
        </Button>
      </div>
    </div>
  );
}

export default function PuzzleGame() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    }>
      <PuzzleContent />
    </Suspense>
  );
}

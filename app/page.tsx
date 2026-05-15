"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";

export const dynamic = "force-dynamic";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Dynamic Split Background */}
      <div className="absolute inset-0 flex flex-col md:flex-row w-full h-full z-0 overflow-y-auto md:overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full h-1/2 md:w-1/2 md:h-full bg-gradient-to-br from-[#1a0505] to-background border-b md:border-b-0 md:border-r border-primary/20 relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 flex items-center justify-center flex-col p-6 md:p-12 text-center z-10">
            <h2 className="text-4xl md:text-7xl font-bold text-primary mb-2 md:mb-4 tracking-tighter mix-blend-screen drop-shadow-2xl">
              JALUR SAMURAI
            </h2>
            <p className="text-foreground/80 mb-6 md:mb-8 max-w-xs md:max-w-sm text-sm md:text-lg">
              Kuasai hiragana, katakana, dan kanji. Pelajari bahasa Jepang dari level dasar (JLPT N5) dengan disiplin seorang Samurai.
            </p>
            <Button size="lg" variant="samurai" className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 rounded-full group-hover:scale-105 transition-transform" onClick={() => router.push("/register")}>
              Pilih Pedangmu
            </Button>
          </div>
          {/* Japanese Kanji Decorative */}
          <div className="absolute -left-10 md:-left-20 bottom-0 text-[15rem] md:text-[30rem] font-bold text-primary/5 select-none pointer-events-none hidden md:block">
            侍
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full h-1/2 md:w-1/2 md:h-full bg-gradient-to-bl from-[#1a1a05] to-background relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 flex items-center justify-center flex-col p-6 md:p-12 text-center z-10">
            <h2 className="text-4xl md:text-7xl font-bold text-secondary mb-2 md:mb-4 tracking-tighter mix-blend-screen drop-shadow-2xl">
              JALUR NAGA
            </h2>
            <p className="text-foreground/80 mb-6 md:mb-8 max-w-xs md:max-w-sm text-sm md:text-lg">
              Pahami pinyin dan kuasai hanzi. Jelajahi bahasa Mandarin dari tingkat awal (HSK 1) dengan kebijaksanaan seekor Naga.
            </p>
            <Button size="lg" variant="dragon" className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 rounded-full group-hover:scale-105 transition-transform" onClick={() => router.push("/register")}>
              Bangkitkan Nagamu
            </Button>
          </div>
          {/* Chinese Character Decorative */}
          <div className="absolute -right-10 md:-right-20 top-0 text-[15rem] md:text-[30rem] font-bold text-secondary/5 select-none pointer-events-none hidden md:block">
            龍
          </div>
        </motion.div>
      </div>

      {/* Center Branding */}
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
        className="absolute z-20 flex flex-col items-center"
      >
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-background/80 backdrop-blur-md border border-foreground/10 flex items-center justify-center shadow-2xl overflow-hidden glass">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50">
              KANZI
            </h1>
            <p className="text-sm font-semibold tracking-widest text-foreground/50">EDU</p>
          </div>
        </div>
      </motion.div>

      {/* Top Right Navigation (Login) */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute top-6 right-6 z-30 flex gap-4"
      >
        <Button variant="ghost" onClick={() => router.push("/login")} className="rounded-full bg-background/20 backdrop-blur-sm border border-foreground/10 hover:bg-background/40">
          <LogIn className="mr-2" size={16} /> Masuk
        </Button>
        <Button variant="outline" onClick={() => router.push("/register")} className="rounded-full bg-background/20 backdrop-blur-sm border border-foreground/10 hover:bg-background/40">
          <UserPlus className="mr-2" size={16} /> Daftar
        </Button>
      </motion.div>
    </main>
  );
}

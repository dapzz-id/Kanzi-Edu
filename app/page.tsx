"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#080808] text-white relative overflow-hidden">

      {/* NOISE TEXTURE overlay */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* NAV */}
      <nav className="relative z-50 flex items-center justify-between px-5 md:px-12 py-5">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center bg-white/5">
            <span className="text-[10px] font-black tracking-tight">K</span>
          </div>
          <span className="text-sm font-semibold tracking-widest text-white/60 uppercase">Kanzi Edu</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-2"
        >
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-1.5 text-[11px] font-medium text-white/50 hover:text-white/80
              px-3.5 py-2 rounded-lg border border-transparent hover:border-white/10 transition-all"
          >
            <LogIn size={12} /> Masuk
          </button>
          <button
            onClick={() => router.push("/register")}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-white
              px-3.5 py-2 rounded-lg bg-white/10 border border-white/15 hover:bg-white/15 transition-all"
          >
            <UserPlus size={12} /> Daftar
          </button>
        </motion.div>
      </nav>

      {/* HERO HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 text-center px-6 pt-10 pb-12 md:pt-16 md:pb-16"
      >
        <p className="text-[10px] tracking-[0.35em] uppercase text-white/30 mb-4">Pilih jalurmu</p>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none mb-4">
          Belajar Bahasa Asia<br />
          <span className="text-white/20">dengan cara yang epik.</span>
        </h1>
        <p className="text-white/40 text-sm md:text-base max-w-md mx-auto">
          Dua jalur. Dua filosofi. Satu tujuan: fasih.
        </p>
      </motion.div>

      {/* PATH CARDS — horizontal scroll on mobile, side-by-side on desktop */}
      <div className="relative z-10 px-4 md:px-12 pb-16">
        <div className="flex flex-col md:flex-row gap-4 md:gap-5 max-w-4xl mx-auto">

          {/* SAMURAI CARD */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onClick={() => router.push("/register")}
            className="flex-1 relative rounded-2xl overflow-hidden cursor-pointer
              border border-[#dc4646]/20 hover:border-[#dc4646]/40
              bg-gradient-to-b from-[#1a0707] to-[#0d0404]
              group transition-all duration-300
              hover:shadow-[0_20px_60px_rgba(220,70,70,0.15)]"
          >
            {/* Top accent */}
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#dc4646] to-transparent" />

            <div className="p-7 md:p-8">
              {/* Icon area */}
              <div className="flex items-start justify-between mb-8">
                <div className="text-6xl md:text-7xl font-bold text-[#dc4646]/15 leading-none select-none
                  group-hover:text-[#dc4646]/25 transition-colors duration-300 font-serif">
                  侍
                </div>
                <span className="text-[9px] tracking-[0.2em] uppercase font-bold
                  text-[#dc4646] bg-[#dc4646]/10 border border-[#dc4646]/20
                  px-2.5 py-1 rounded-full">
                  JLPT N5
                </span>
              </div>

              {/* Content */}
              <div className="mb-8">
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#dc4646]/70 mb-2 font-semibold">
                  Bahasa Jepang
                </p>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none mb-4">
                  Jalur<br />Samurai
                </h2>
                <p className="text-white/40 text-sm leading-relaxed">
                  Kuasai hiragana, katakana, dan kanji. Disiplin seperti seorang samurai, dari N5 sampai mahir.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-2 mb-8">
                {["Hiragana & Katakana", "Kanji JLPT N5", "Tata Bahasa Dasar", "Kosakata Sehari-hari"].map(f => (
                  <div key={f} className="flex items-center gap-2.5 text-xs text-white/35">
                    <div className="w-1 h-1 rounded-full bg-[#dc4646]/60 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex items-center justify-between">
                <button className="flex items-center gap-2 text-sm font-bold text-[#dc4646]
                  group-hover:gap-3 transition-all duration-300">
                  Pilih Pedangmu <ChevronRight size={14} />
                </button>
                <div className="w-8 h-8 rounded-full border border-[#dc4646]/20
                  group-hover:border-[#dc4646]/50 group-hover:bg-[#dc4646]/10
                  flex items-center justify-center transition-all duration-300">
                  <ChevronRight size={12} className="text-[#dc4646]" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* DRAGON CARD */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            onClick={() => router.push("/register")}
            className="flex-1 relative rounded-2xl overflow-hidden cursor-pointer
              border border-[#c9a832]/20 hover:border-[#c9a832]/40
              bg-gradient-to-b from-[#17140a] to-[#0d0c04]
              group transition-all duration-300
              hover:shadow-[0_20px_60px_rgba(201,168,50,0.12)]"
          >
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#c9a832] to-transparent" />

            <div className="p-7 md:p-8">
              <div className="flex items-start justify-between mb-8">
                <div className="text-6xl md:text-7xl font-bold text-[#c9a832]/15 leading-none select-none
                  group-hover:text-[#c9a832]/25 transition-colors duration-300 font-serif">
                  龍
                </div>
                <span className="text-[9px] tracking-[0.2em] uppercase font-bold
                  text-[#c9a832] bg-[#c9a832]/10 border border-[#c9a832]/20
                  px-2.5 py-1 rounded-full">
                  HSK 1
                </span>
              </div>

              <div className="mb-8">
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#c9a832]/70 mb-2 font-semibold">
                  Bahasa Mandarin
                </p>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none mb-4">
                  Jalur<br />Naga
                </h2>
                <p className="text-white/40 text-sm leading-relaxed">
                  Pahami pinyin dan kuasai hanzi. Kebijaksanaan naga membimbingmu dari HSK 1 menuju mahir.
                </p>
              </div>

              <div className="space-y-2 mb-8">
                {["Pinyin & Nada", "Hanzi HSK 1", "Percakapan Dasar", "Budaya & Konteks"].map(f => (
                  <div key={f} className="flex items-center gap-2.5 text-xs text-white/35">
                    <div className="w-1 h-1 rounded-full bg-[#c9a832]/60 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <button className="flex items-center gap-2 text-sm font-bold text-[#c9a832]
                  group-hover:gap-3 transition-all duration-300">
                  Bangkitkan Nagamu <ChevronRight size={14} />
                </button>
                <div className="w-8 h-8 rounded-full border border-[#c9a832]/20
                  group-hover:border-[#c9a832]/50 group-hover:bg-[#c9a832]/10
                  flex items-center justify-center transition-all duration-300">
                  <ChevronRight size={12} className="text-[#c9a832]" />
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

    </main>
  );
}
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Swords, Radar } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, where, doc, updateDoc, getDocs, limit, serverTimestamp } from "firebase/firestore";

// Bank Soal Berdasarkan Jalur
const QUESTION_POOLS = {
  samurai: [
    { char: "刀", correct: "Pedang (Katana)", options: ["Panah", "Pedang (Katana)", "Perisai", "Tombak"] },
    { char: "先生", correct: "Guru", options: ["Murid", "Guru", "Dokter", "Polisi"] },
    { char: "学生", correct: "Murid", options: ["Guru", "Karyawan", "Murid", "Anak"] },
    { char: "日本語", correct: "Bahasa Jepang", options: ["Bahasa Mandarin", "Bahasa Jepang", "Bahasa Inggris", "Bahasa Korea"] },
    { char: "心", correct: "Hati/Jiwa", options: ["Kepala", "Tangan", "Hati/Jiwa", "Kaki"] },
    { char: "食べる", correct: "Makan", options: ["Minum", "Makan", "Tidur", "Lari"] },
    { char: "水", correct: "Air", options: ["Api", "Tanah", "Angin", "Air"] },
    { char: "山", correct: "Gunung", options: ["Lautan", "Sungai", "Gunung", "Hutan"] },
    { char: "猫", correct: "Kucing", options: ["Anjing", "Kucing", "Burung", "Ikan"] },
    { char: "速い", correct: "Cepat", options: ["Lambat", "Cepat", "Tinggi", "Pendek"] },
  ],
  dragon: [
    { char: "龙", correct: "Naga", options: ["Harimau", "Naga", "Burung", "Ular"] },
    { char: "老师", correct: "Guru", options: ["Murid", "Guru", "Dokter", "Polisi"] },
    { char: "学生", correct: "Murid", options: ["Guru", "Karyawan", "Murid", "Anak"] },
    { char: "汉语", correct: "Bahasa Mandarin", options: ["Bahasa Mandarin", "Bahasa Jepang", "Bahasa Inggris", "Bahasa Korea"] },
    { char: "家", correct: "Rumah/Keluarga", options: ["Sekolah", "Kantor", "Pasar", "Rumah/Keluarga"] },
    { char: "吃饭", correct: "Makan", options: ["Minum", "Makan", "Tidur", "Lari"] },
    { char: "火", correct: "Api", options: ["Api", "Tanah", "Angin", "Air"] },
    { char: "书", correct: "Buku", options: ["Pena", "Meja", "Buku", "Kertas"] },
    { char: "漂亮", correct: "Cantik", options: ["Ganteng", "Cantik", "Pintar", "Kaya"] },
    { char: "大", correct: "Besar", options: ["Kecil", "Besar", "Tinggi", "Pendek"] },
  ]
};

export default function PvPLobby() {
  const router = useRouter();
  const [searching, setSearching] = useState(false);
  const [matchFound, setMatchFound] = useState(false);
  const [selectedPath, setSelectedPath] = useState<"samurai" | "dragon">("samurai");
  const [error, setError] = useState("");

  const handleSearch = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError("Silakan login terlebih dahulu.");
      return;
    }

    setSearching(true);
    setError("");

    try {
      // Cari beberapa match yang tersedia
      const q = query(
        collection(db, "matches"), 
        where("status", "==", "waiting"),
        where("path", "==", selectedPath),
        limit(5) // Ambil beberapa untuk difilter
      );
      
      const querySnapshot = await getDocs(q);
      
      // Cari match yang BUKAN milik saya sendiri
      const validMatch = querySnapshot.docs.find(doc => doc.data().player1.uid !== user.uid);

      if (validMatch) {
        const matchId = validMatch.id;
        
        await updateDoc(doc(db, "matches", matchId), {
          player2: {
            uid: user.uid,
            name: user.displayName || "Pemain 2",
            hp: 100,
            score: 0,
            ready: true
          },
          status: "playing",
          startTime: serverTimestamp()
        });
        
        setMatchFound(true);
        setTimeout(() => router.push(`/pvp/arena/${matchId}`), 1500);
      } else {
        // Acak 10 soal dari pool
        const shuffledQuestions = [...QUESTION_POOLS[selectedPath]]
          .sort(() => Math.random() - 0.5)
          .slice(0, 10);

        const newMatch = await addDoc(collection(db, "matches"), {
          player1: {
            uid: user.uid,
            name: user.displayName || "Pemain 1",
            hp: 100,
            score: 0,
            ready: true
          },
          path: selectedPath,
          status: "waiting",
          createdAt: serverTimestamp(),
          currentQuestionIndex: 0,
          questions: shuffledQuestions
        });

        const unsubscribe = onSnapshot(doc(db, "matches", newMatch.id), (doc) => {
          if (doc.exists() && doc.data().status === "playing") {
            setMatchFound(true);
            unsubscribe();
            setTimeout(() => router.push(`/pvp/arena/${newMatch.id}`), 1500);
          }
        });
      }
    } catch (err) {
      console.error(err);
      setError("Gagal mencari lawan. Periksa koneksi atau Firestore Rules.");
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4 bg-gradient-to-br from-[#1a0505] via-background to-[#1a1a05] text-foreground">
      <div className="flex items-center max-w-2xl mx-auto w-full mb-8 z-10">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
          <ArrowLeft />
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full z-10 px-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center w-full">
          <div className="relative mb-6 md:mb-10">
            <Swords size={60} className="mx-auto text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] md:w-20 md:h-20" />
            {searching && (
              <motion.div
                animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 bg-red-500 rounded-full z-[-1]"
              />
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-yellow-500 uppercase tracking-tighter">Arena PvP</h1>
          <p className="text-sm md:text-base text-foreground/60 mb-8 md:mb-10">Pilih jalurmu dan buktikan siapa yang terkuat!</p>

          {!searching && !matchFound && (
            <div className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <Button 
                  variant={selectedPath === "samurai" ? "samurai" : "outline"}
                  className={`h-20 md:h-28 flex flex-col gap-1 md:gap-2 transition-all active:scale-95 ${selectedPath === "samurai" ? "ring-2 ring-red-500 ring-offset-2 ring-offset-background" : ""}`}
                  onClick={() => setSelectedPath("samurai")}
                >
                  <span className="text-xl md:text-3xl">🥷</span>
                  <span className="text-xs md:text-sm font-bold uppercase">Samurai</span>
                </Button>
                <Button 
                  variant={selectedPath === "dragon" ? "dragon" : "outline"}
                  className={`h-20 md:h-28 flex flex-col gap-1 md:gap-2 transition-all active:scale-95 ${selectedPath === "dragon" ? "ring-2 ring-amber-500 ring-offset-2 ring-offset-background" : ""}`}
                  onClick={() => setSelectedPath("dragon")}
                >
                  <span className="text-xl md:text-3xl">🐉</span>
                  <span className="text-xs md:text-sm font-bold uppercase">Naga</span>
                </Button>
              </div>

              <Button 
                size="lg" 
                className="w-full h-14 md:h-16 text-lg md:text-xl rounded-full bg-red-600 hover:bg-red-700 shadow-xl shadow-red-900/20 active:scale-[0.98] transition-transform"
                onClick={handleSearch}
              >
                <Radar className="mr-2 h-5 w-5 md:h-6 md:w-6" /> Cari Lawan
              </Button>
            </div>
          )}

          {searching && !matchFound && (
            <div className="flex flex-col items-center py-6">
              <div className="w-10 h-10 md:w-14 md:h-14 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-base md:text-xl font-bold animate-pulse text-red-400">Mencari lawan {selectedPath === "samurai" ? "Samurai" : "Naga"}...</p>
              <Button variant="ghost" className="mt-8 text-foreground/40 hover:text-red-500 transition-colors" onClick={() => window.location.reload()}>Batalkan</Button>
            </div>
          )}

          {matchFound && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-red-500/20 border border-red-500/50 p-6 md:p-8 rounded-2xl glass shadow-2xl">
              <h2 className="text-2xl md:text-3xl font-black text-red-500 mb-2 italic">PERTEMPURAN MULAI!</h2>
              <p className="text-sm md:text-base text-foreground/70 animate-pulse uppercase tracking-widest">Menuju arena pertarungan...</p>
            </motion.div>
          )}

          {error && <p className="text-red-500 mt-4 text-xs md:text-sm bg-red-500/10 p-2 rounded">{error}</p>}
        </motion.div>
      </div>
    </div>
  );
}

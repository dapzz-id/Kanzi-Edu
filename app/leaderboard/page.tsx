"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Trophy, 
  Medal, 
  Crown, 
  User, 
  Loader2, 
  TrendingUp,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

interface LeaderboardUser {
  id: string;
  name: string;
  xp: number;
  rank: string;
  photoURL?: string;
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(
          collection(db, "users"),
          orderBy("xp", "desc"),
          limit(20)
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as LeaderboardUser[];
        setUsers(data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <p className="text-foreground/50 animate-pulse">Memuat Papan Peringkat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/15 to-transparent pt-16 pb-24 px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push("/dashboard")}
            className="absolute left-0 top-0 rounded-full bg-foreground/5 backdrop-blur-xl h-10 w-10"
          >
            <ArrowLeft size={18} />
          </Button>
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 md:w-20 md:h-20 bg-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(234,179,8,0.3)] border-4 border-background"
          >
            <Crown className="text-white w-8 h-8 md:w-10 md:h-10" />
          </motion.div>
          
          <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter mb-3 leading-none">LEADERBOARD</h1>
          <p className="text-xs md:text-sm text-foreground/50 max-w-[280px] md:max-w-md mx-auto leading-relaxed">
            Pejuang bahasa terbaik di Kanzi Edu. Terus belajar dan raih puncak!
          </p>
        </div>
      </div>

      {/* List Section */}
      <div className="max-w-2xl mx-auto px-4 -mt-12 relative z-20">
        <div className="space-y-3">
          {users.map((user, index) => {
            const isMe = user.id === currentUser?.uid;
            const rank = index + 1;
            
            return (
              <motion.div
                key={user.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`glass transition-all duration-300 border-white/5 ${isMe ? 'ring-2 ring-primary/40 shadow-xl bg-primary/10' : 'hover:bg-white/5'}`}>
                  <CardContent className="p-3 md:p-5 flex items-center gap-3 md:gap-5">
                    {/* Rank Indicator */}
                    <div className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center shrink-0">
                      {rank === 1 && <Trophy className="text-yellow-500 w-6 h-6 md:w-8 md:h-8" />}
                      {rank === 2 && <Medal className="text-gray-400 w-6 h-6 md:w-8 md:h-8" />}
                      {rank === 3 && <Medal className="text-amber-600 w-6 h-6 md:w-8 md:h-8" />}
                      {rank > 3 && <span className="font-black opacity-20 italic text-lg md:text-2xl">#{rank}</span>}
                    </div>

                    {/* Avatar */}
                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-foreground/5 flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="opacity-20 w-5 h-5 md:w-7 md:h-7" />
                      )}
                    </div>

                    {/* Name & Rank Info */}
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className={`font-bold text-sm md:text-lg truncate leading-tight ${isMe ? 'text-primary' : ''}`}>
                          {user.name}
                        </p>
                        {rank === 1 && <Sparkles className="text-yellow-500 shrink-0 w-3 h-3" />}
                      </div>
                      <div className="flex items-center gap-1 opacity-40">
                        <TrendingUp size={10} />
                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest truncate">{user.rank || "Warrior"}</span>
                      </div>
                    </div>

                    {/* Stats Area */}
                    <div className="text-right shrink-0">
                      <p className={`font-black text-base md:text-2xl leading-none tracking-tighter ${isMe ? 'text-primary' : ''}`}>
                        {user.xp?.toLocaleString()}
                      </p>
                      <p className="text-[7px] md:text-[9px] font-bold opacity-30 uppercase tracking-tighter mt-1">TOTAL XP</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {users.length === 0 && !loading && (
          <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-white/5">
            <Trophy size={48} className="mx-auto mb-4 opacity-10" />
            <p className="opacity-50">Belum ada pejuang di papan peringkat.</p>
          </div>
        )}
      </div>
    </div>
  );
}

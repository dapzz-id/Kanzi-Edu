"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Flame, Trophy, Swords, BookOpen, User, LogOut } from "lucide-react";
import { SkillTree } from "@/components/SkillTree";
import { UserActivityChart } from "@/components/UserActivityChart";

interface UserData {
  name?: string;
  levelSamurai?: number;
  levelDragon?: number;
  xp?: number;
  xpSamurai?: number;
  xpDragon?: number;
  rank?: string;
  streak?: number;
  path?: "samurai" | "dragon";
  historyXP?: Record<string, number>;
  historyXPSamurai?: Record<string, number>;
  historyXPDragon?: Record<string, number>;
}

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePath, setActivePath] = useState<"samurai" | "dragon">("samurai");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          // Baca level per jalur dari localStorage sebagai baseline (dengan UID)
          const localLevelSamurai = parseInt(localStorage.getItem(`kanzi_level_${user.uid}_samurai`) || "1");
          const localLevelDragon = parseInt(localStorage.getItem(`kanzi_level_${user.uid}_dragon`) || "1");

          const docRef = doc(db, "users", user.uid);
          const docSnap = await Promise.race([
            getDoc(docRef),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000))
          ]);

          if (docSnap.exists()) {
            const data = docSnap.data() as UserData;
            // Gunakan nilai tertinggi antara Firestore dan localStorage per jalur
            setUserData({
              ...data,
              levelSamurai: Math.max(data.levelSamurai || 1, localLevelSamurai),
              levelDragon: Math.max(data.levelDragon || 1, localLevelDragon),
            });
          } else {
            setUserData({
              name: user.displayName || "Pemain",
              levelSamurai: localLevelSamurai,
              levelDragon: localLevelDragon,
              xp: 0, rank: "Warrior", streak: 0
            });
          }
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching Firestore:", error);
        if (user) {
          setUserData({
            name: user.displayName || "Pemain",
            levelSamurai: parseInt(localStorage.getItem("kanzi_level_samurai") || "1"),
            levelDragon: parseInt(localStorage.getItem("kanzi_level_dragon") || "1"),
            xp: 0, rank: "Warrior", streak: 0,
          });
        }
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Memuat...
      </div>
    );
  }

  if (!userData) return null;

  const isSamurai = activePath === "samurai";
  const themeClass = isSamurai ? "text-primary" : "text-secondary";
  const currentLevel = (isSamurai ? userData.levelSamurai : userData.levelDragon) || 1;
  const currentXP = isSamurai ? (userData.xpSamurai || 0) : (userData.xpDragon || 0);
  const currentHistoryXP = isSamurai ? (userData.historyXPSamurai || {}) : (userData.historyXPDragon || {});

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      {/* Top Navigation Bar */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
        <div className="flex w-full justify-between items-center md:w-auto">
          <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Kanzi Edu
          </h1>
          
          {/* Mobile Streak, Leaderboard & Logout */}
          <div className="flex items-center gap-2 md:hidden">
            <Button variant="ghost" size="icon" onClick={() => router.push("/leaderboard")} className="h-8 w-8 text-yellow-500">
              <Trophy size={16} />
            </Button>
            <div className="flex items-center gap-1 glass-panel px-3 py-1.5 rounded-full text-xs">
              <Flame className="text-orange-500" size={14} />
              <span className="font-bold">{userData.streak || 0}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="h-8 w-8">
              <LogOut size={16} />
            </Button>
          </div>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-foreground/5 p-1 rounded-full w-full md:w-auto">
          <button 
            onClick={() => setActivePath("samurai")}
            className={`flex-1 md:w-40 py-2 px-4 rounded-full text-xs md:text-sm font-bold transition-all ${isSamurai ? 'bg-primary text-primary-foreground shadow-md' : 'text-foreground/60 hover:text-foreground'}`}
          >
            Jalur Samurai
          </button>
          <button 
            onClick={() => setActivePath("dragon")}
            className={`flex-1 md:w-40 py-2 px-4 rounded-full text-xs md:text-sm font-bold transition-all ${!isSamurai ? 'bg-secondary text-secondary-foreground shadow-md' : 'text-foreground/60 hover:text-foreground'}`}
          >
            Jalur Naga
          </button>
        </div>

        {/* Desktop Stats */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="ghost"
            className="flex items-center gap-2 glass-panel px-4 py-2 rounded-full hover:bg-white/10 transition-all"
            onClick={() => router.push("/leaderboard")}
          >
            <Trophy className="text-yellow-500" size={20} />
            <span className="font-bold text-sm">Leaderboard</span>
          </Button>
          <div className="flex items-center gap-2 glass-panel px-4 py-2 rounded-full">
            <Flame className="text-orange-500" size={20} />
            <span className="font-bold">{userData.streak || 0} Hari</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Keluar"
            className="rounded-full hover:bg-red-500/10 hover:text-red-500 transition-all"
          >
            <LogOut size={20} />
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Player Stats & Menu */}
        <div className="space-y-6 md:col-span-1">
          <Card className="glass overflow-hidden border-t-4 border-t-primary relative">
            <div
              className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-bl-full ${isSamurai ? "bg-primary" : "bg-secondary"}`}
            />
            <CardHeader>
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-background ${isSamurai ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"} shadow-lg z-10`}
                >
                  {userData.name ? (
                    userData.name.charAt(0).toUpperCase()
                  ) : (
                    <User />
                  )}
                </div>
                <div>
                  <CardTitle>{userData.name || "Pemain"}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1 font-semibold">
                    <Trophy size={16} className={themeClass} /> Rank:{" "}
                    {userData.rank || "Warrior"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Level {currentLevel}</span>
                  <span className="text-foreground/50">
                    {currentXP} / 1000 XP
                  </span>
                </div>
                <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${isSamurai ? "bg-primary" : "bg-secondary"}`}
                    style={{ width: `${(currentXP / 1000) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg">Arena Pelatihan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => router.push(`/games/match-up?path=${activePath}`)}
              >
                <BookOpen className="mr-2" size={18} /> Match-Up (Solo)
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => router.push(`/games/puzzle?path=${activePath}`)}
              >
                <BookOpen className="mr-2" size={18} /> Puzzle Kalimat (Solo)
              </Button>
              {!isSamurai && (
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => router.push(`/games/pinyin-check?path=${activePath}`)}
                >
                  <BookOpen className="mr-2" size={18} /> Latihan Nada (Solo)
                </Button>
              )}
              <Button
                className="w-full justify-start mt-4 border-red-500/50 text-red-500 hover:bg-red-500/10"
                variant="outline"
                onClick={() => router.push("/pvp")}
              >
                <Swords className="mr-2" size={18} /> Mode PvP (1v1)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Skill Tree */}
        <div className="md:col-span-2">
          <Card className="glass h-full">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Jalur Keahlian</CardTitle>
              <CardDescription>
                Selesaikan modul untuk membuka materi berikutnya.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-12">
              <SkillTree path={activePath} userLevel={currentLevel} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Statistics Row */}
      <div className="max-w-6xl mx-auto mt-8">
        <UserActivityChart activePath={activePath} historyXP={currentHistoryXP} currentXP={currentXP} streak={userData.streak || 0} />
      </div>
    </div>
  );
}

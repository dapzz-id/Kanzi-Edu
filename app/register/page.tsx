"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { useEffect } from "react";
import { auth, googleProvider, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { UserPlus, Globe, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) router.push("/dashboard");
    });
    return () => unsubscribe();
  }, [router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await updateProfile(userCredential.user, { displayName: name });

      // Initialize user data in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email,
        path: null, // 'samurai' or 'dragon'
        levelSamurai: 1,
        levelDragon: 1,
        xp: 0,
        xpSamurai: 0,
        xpDragon: 0,
        rank: "Warrior",
        streak: 0,
        createdAt: new Date(),
      });

      router.push("/");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mendaftar. Silakan coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        const userRef = doc(db, "users", result.user.uid);
        const snap = await getDoc(userRef);
        
        if (!snap.exists()) {
          await setDoc(
            userRef,
            {
              name: result.user.displayName,
              email: result.user.email,
              path: null,
              levelSamurai: 1,
              levelDragon: 1,
              xp: 0,
              xpSamurai: 0,
              xpDragon: 0,
              rank: "Warrior",
              streak: 0,
              createdAt: new Date(),
            },
            { merge: true },
          );
        }
        router.push("/dashboard");
      }
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Gagal daftar dengan Google.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-background via-[#001a1a] to-[#000a1a]">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "1.5s" }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="backdrop-blur-xl bg-background/40 border-foreground/10">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary">
              Mulai Perjalanan
            </CardTitle>
            <CardDescription className="text-foreground/80">
              Buat akun Kanzi Edu dan pilih jalur belajarmu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <div className="p-3 text-sm bg-red-500/20 text-red-500 rounded-md border border-red-500/50">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Panggilan</label>
                <Input
                  type="text"
                  placeholder="Ryu / Long"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="ninja@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full font-bold"
                variant="dragon"
                disabled={loading}
              >
                {loading ? (
                  "Mendaftar..."
                ) : (
                  <>
                    <UserPlus className="mr-2" size={18} /> Daftar
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 flex items-center">
              <div className="flex-1 border-t border-foreground/20"></div>
              <span className="px-3 text-sm text-foreground/50">ATAU</span>
              <div className="flex-1 border-t border-foreground/20"></div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full mt-6 bg-background/50 hover:bg-background/80"
              onClick={handleGoogleLogin}
            >
              <Globe className="mr-2 text-blue-500" size={18} />
              Daftar dengan Google
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-foreground/70">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="ml-1 text-primary font-semibold hover:underline"
            >
              Masuk
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

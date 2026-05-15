"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

const SKILL_LABELS = ["Angka Dasar", "Salam & Sapaan", "Keluarga", "Waktu & Hari", "Makanan & Minuman", "Arah & Lokasi"];

export function SkillTree({ path = "samurai", userLevel = 1 }: { path?: "samurai" | "dragon", userLevel?: number }) {
  const router = useRouter();
  const isSamurai = path === "samurai";
  const primaryColor = isSamurai ? "bg-primary" : "bg-secondary";
  const borderColor = isSamurai ? "border-primary" : "border-secondary";
  const textColor = isSamurai ? "text-primary" : "text-secondary";

  const skills = SKILL_LABELS.map((label, index) => {
    const levelRequired = index + 1;
    return {
      id: String(levelRequired),
      label,
      unlocked: userLevel >= levelRequired,
      completed: userLevel > levelRequired,
    };
  });

  return (
    <div className="relative flex flex-col items-center py-8">
      {/* Connecting Line */}
      <div className={cn("absolute top-0 bottom-0 left-1/2 w-1 -translate-x-1/2 z-0 opacity-20", primaryColor)} />

      <div className="space-y-8 z-10 w-full max-w-sm px-4">
        {skills.map((skill, index) => {
          const isLeft = index % 2 === 0;
          return (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn("flex items-center justify-between w-full relative", isLeft ? "flex-row" : "flex-row-reverse")}
            >
              {/* Tooltip / Label */}
              <div className={cn("w-5/12 text-center", isLeft ? "text-right pr-4" : "text-left pl-4")}>
                <span className={cn("font-bold text-sm", skill.completed ? textColor : "text-foreground/50")}>
                  {skill.label}
                </span>
              </div>

              {/* Node */}
              <div
                onClick={() => skill.unlocked && router.push(`/learn/${skill.id}?path=${path}`)}
                className={cn(
                  "w-16 h-16 rounded-full border-4 flex items-center justify-center bg-background shrink-0 relative transition-all duration-300",
                  skill.completed ? borderColor : "border-foreground/20",
                  skill.unlocked && !skill.completed ? `${borderColor} shadow-[0_0_15px_rgba(var(--${isSamurai ? "primary" : "secondary"}),0.5)] cursor-pointer hover:scale-110` : "cursor-not-allowed opacity-70",
                  skill.completed && "cursor-pointer hover:scale-105"
                )}
              >
                {skill.completed ? (
                  <CheckCircle2 className={textColor} size={32} />
                ) : skill.unlocked ? (
                  <span className={cn("font-bold", textColor)}>{index + 1}</span>
                ) : (
                  <Lock className="text-foreground/20" size={24} />
                )}
              </div>

              {/* Empty Space for alignment */}
              <div className="w-5/12"></div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

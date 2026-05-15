"use client";

import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { use } from "react";
import { SkillTree } from "@/components/SkillTree";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function CurriculumPage({ params }: { params: Promise<{ path: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const path = resolvedParams.path as "samurai" | "dragon";
  
  const isSamurai = path === "samurai";

  return (
    <div className="min-h-screen flex flex-col p-6 bg-gradient-to-b from-background to-background/50">
      <div className="max-w-4xl mx-auto w-full mb-8 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
          <ArrowLeft />
        </Button>
        <div className="flex items-center gap-2">
          <BookOpen className={isSamurai ? "text-primary" : "text-secondary"} />
          <h1 className="text-2xl font-bold">
            Kurikulum {isSamurai ? "Jalur Samurai" : "Jalur Naga"}
          </h1>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="max-w-4xl mx-auto w-full flex-1">
        <Card className="glass">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Peta Perjalananmu</CardTitle>
            <CardDescription>
              {isSamurai 
                ? "Pelajari JLPT N5 secara bertahap. Taklukkan setiap modul untuk menjadi Samurai sejati."
                : "Pelajari HSK 1 secara berurutan. Kumpulkan kebijaksanaan untuk membangkitkan Sang Naga."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-12">
            <SkillTree path={path} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

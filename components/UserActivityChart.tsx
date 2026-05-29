"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Deterministic distribution of XP for visual chart
// Realistis berdasarkan data DB saat ini (menggunakan field historyXP)
function generateDailyData(historyXP: Record<string, number>) {
  const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const result = [];
  
  // 6 hari ke belakang sampai hari ini
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateString = d.toISOString().split("T")[0]; // YYYY-MM-DD
    const dayName = days[d.getDay()];
    
    result.push({
      name: i === 0 ? "Hari ini" : dayName,
      xp: historyXP[dateString] || 0
    });
  }
  return result;
}

function generateMonthlyData(historyXP: Record<string, number>) {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
  const result = [];
  
  // 5 bulan ke belakang sampai bulan ini
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthPrefix = d.toISOString().slice(0, 7); // YYYY-MM
    const monthName = months[d.getMonth()];
    
    let totalXpForMonth = 0;
    for (const [dateStr, xp] of Object.entries(historyXP)) {
      if (dateStr.startsWith(monthPrefix)) {
        totalXpForMonth += xp;
      }
    }
    
    result.push({
      name: i === 0 ? "Bulan ini" : monthName,
      xp: totalXpForMonth
    });
  }
  return result;
}

export function UserActivityChart({ activePath, historyXP }: { activePath: "samurai" | "dragon", historyXP: Record<string, number> }) {
  const [view, setView] = useState<"daily" | "monthly">("daily");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Menyembunyikan warning Recharts yang mengganggu tapi tidak berbahaya
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('The width(-1) and height(-1) of chart should be greater than 0')) {
        return; // Abaikan warning spesifik ini
      }
      originalWarn.apply(console, args);
    };

    return () => {
      console.warn = originalWarn; // Kembalikan seperti semula
    };
  }, []);
  
  const dailyData = generateDailyData(historyXP);
  const monthlyData = generateMonthlyData(historyXP);
  
  const data = view === "daily" ? dailyData : monthlyData;
  const themeColor = activePath === "samurai" ? "#ef4444" : "#3b82f6"; // bg-primary (red) / bg-secondary (blue)

  return (
    <Card className="glass mt-8 border-t-4" style={{ borderTopColor: themeColor }}>
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <CardTitle>Statistik Pembelajaran</CardTitle>
          <CardDescription>
            Perkembangan XP Anda dalam mode {activePath === "samurai" ? "Samurai" : "Naga"}.
          </CardDescription>
        </div>
        <div className="flex bg-foreground/5 p-1 rounded-full w-full md:w-auto">
          <button 
            onClick={() => setView("daily")}
            className={`flex-1 md:w-32 py-1.5 px-4 rounded-full text-xs font-bold transition-all ${view === 'daily' ? 'bg-background shadow-md' : 'text-foreground/60 hover:text-foreground'}`}
          >
            Harian
          </button>
          <button 
            onClick={() => setView("monthly")}
            className={`flex-1 md:w-32 py-1.5 px-4 rounded-full text-xs font-bold transition-all ${view === 'monthly' ? 'bg-background shadow-md' : 'text-foreground/60 hover:text-foreground'}`}
          >
            Bulanan
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {mounted ? (
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="99%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Bar 
                  dataKey="xp" 
                  fill={themeColor} 
                  radius={[4, 4, 0, 0]} 
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] w-full mt-4 flex items-center justify-center bg-white/5 rounded-xl animate-pulse">
            <span className="text-foreground/30 font-bold text-sm uppercase">Memuat Grafik...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Flame, Calendar, Award } from "lucide-react";

function generateDailyData(historyXP: Record<string, number>) {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
  const result = [];
  let currentWeekXP = 0;
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateString = d.toISOString().split("T")[0]; // YYYY-MM-DD
    const dayDate = d.getDate();
    const monthStr = months[d.getMonth()];
    const xp = historyXP[dateString] || 0;
    
    currentWeekXP += xp;
    
    result.push({
      name: i === 0 ? "Hari ini" : `${dayDate} ${monthStr}`,
      xp: xp
    });
  }
  return { result, currentWeekXP };
}

export function UserActivityChart({ 
  activePath, 
  historyXP,
  currentXP,
  streak
}: { 
  activePath: "samurai" | "dragon", 
  historyXP: Record<string, number>,
  currentXP: number,
  streak: number
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Menyembunyikan warning Recharts yang mengganggu tapi tidak berbahaya
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('The width(-1) and height(-1) of chart should be greater than 0')) return;
      originalWarn.apply(console, args);
    };
    return () => { console.warn = originalWarn; };
  }, []);
  
  const { result: dailyData, currentWeekXP } = generateDailyData(historyXP);
  
  // Rata-rata XP per hari (dari 7 hari)
  const averageXP = (currentWeekXP / 7).toFixed(1);
  
  const themeColor = activePath === "samurai" ? "#ef4444" : "#3b82f6";

  if (!mounted) {
    return (
      <Card className="glass mt-8 border-none bg-black/40 h-[400px] flex items-center justify-center animate-pulse">
        <span className="text-foreground/30 font-bold uppercase tracking-widest text-sm">Memuat Grafik...</span>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-8">
      {/* Chart Area */}
      <Card className="lg:col-span-3 glass border-none bg-black/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 pointer-events-none" />
        <CardContent className="p-6 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-black/50 border border-white/5">
                <TrendingUp style={{ color: themeColor }} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Perkembangan XP</h3>
                <p className="text-sm text-foreground/50">Pantau perkembangan XP Anda dari waktu ke waktu.</p>
              </div>
            </div>
            
            <div className="bg-white/5 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 text-sm text-foreground/70">
              <Calendar size={16} /> 7 Hari Terakhir
            </div>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="99%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 30, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={themeColor} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={themeColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} 
                  dy={10}
                />
                <Tooltip 
                  cursor={{ stroke: themeColor, strokeWidth: 1, strokeDasharray: '5 5' }}
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="xp" 
                  stroke={themeColor} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorXp)" 
                  activeDot={{ r: 6, fill: themeColor, stroke: '#fff', strokeWidth: 2 }}
                  label={{ fill: '#fff', fontSize: 12, position: 'top', dy: -10 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 flex items-center gap-2 text-xs text-foreground/50 bg-white/5 p-3 rounded-lg w-fit border border-white/5">
            <Flame size={14} className="text-yellow-500" />
            <span className="font-medium">Konsistensi adalah kunci! Terus belajar setiap hari untuk meningkatkan XP-mu.</span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Panel */}
      <div className="lg:col-span-1 flex flex-col gap-3">
        <Card className="glass border-none bg-black/40 flex-1 flex flex-col justify-center">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 font-bold">
              XP
            </div>
            <div>
              <p className="text-sm text-foreground/50 mb-1">Total XP</p>
              <p className="text-2xl font-bold text-red-500">{currentXP}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-none bg-black/40 flex-1 flex flex-col justify-center">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
              <Award size={24} />
            </div>
            <div>
              <p className="text-sm text-foreground/50 mb-1">XP Minggu Ini</p>
              <p className="text-2xl font-bold text-yellow-500">{currentWeekXP}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-none bg-black/40 flex-1 flex flex-col justify-center">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Flame size={24} />
            </div>
            <div>
              <p className="text-sm text-foreground/50 mb-1">Streak</p>
              <p className="text-2xl font-bold text-blue-500">{streak} Hari</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-none bg-black/40 flex-1 flex flex-col justify-center">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-foreground/50 mb-1">Rata-rata XP/Hari</p>
              <p className="text-2xl font-bold text-green-500">{averageXP}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

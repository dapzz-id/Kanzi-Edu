import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kanzi Edu | Jalur Samurai & Naga",
  description: "Aplikasi pembelajaran interaktif Bahasa Jepang & Mandarin dengan fitur gamification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased dark">
      <body className={`${inter.className} min-h-full flex flex-col bg-background text-foreground`}>
        <main className="flex-1">
          {children}
        </main>
        <footer className="py-6 px-4 border-t border-foreground/5 text-center bg-background/50 backdrop-blur-sm">
          <p className="text-xs md:text-sm text-foreground/40 font-medium">
            &copy; {new Date().getFullYear()} Kanzi Edu AI Platform
          </p>
          <p className="text-[10px] md:text-xs text-foreground/30 mt-1">
            Made with 🔥 by <span className="text-foreground/50">Kadavi Raditya Alvino</span> | 
            <a href="mailto:kadaviradityaa@gmail.com" className="ml-1 hover:text-primary transition-colors">kadaviradityaa@gmail.com</a>
          </p>
        </footer>
      </body>
    </html>
  );
}

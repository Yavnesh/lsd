import type { Metadata } from "next";
import { Inter, Nunito, Fredoka } from "next/font/google";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: 'swap',
  weight: ["400", "600", "700", "800", "900"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  display: 'swap',
  weight: ["600"],
});

export const metadata: Metadata = {
  title: "LSD | Learn Something Daily",
  description: "Become 1% smarter every day with bite-sized, meme-style knowledge.",
  keywords: ["learning", "daily lessons", "gamified education", "micro-learning"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${nunito.variable} ${fredoka.variable} antialiased`}
      >
        <div className="min-h-screen">
          <NextAuthProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
              {children}
            </ThemeProvider>
          </NextAuthProvider>
        </div>
      </body>
    </html>
  );
}

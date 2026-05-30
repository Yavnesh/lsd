import type { Metadata } from "next";
import { Inter, Nunito } from "next/font/google";
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
});

export const metadata: Metadata = {
  title: "LSD | Learn Something Daily",
  description: "Become 1% smarter every day with bite-sized, meme-style knowledge.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${nunito.variable} antialiased selection:bg-brand-primary selection:text-white`}
      >
        <div className="min-h-screen">
          <NextAuthProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              {children}
            </ThemeProvider>
          </NextAuthProvider>
        </div>
      </body>
    </html>
  );
}

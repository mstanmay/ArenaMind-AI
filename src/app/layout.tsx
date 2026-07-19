import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import MotionProvider from "@/components/MotionProvider";
import QueryProvider from "@/components/QueryProvider";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ArenaMind AI — Smart Stadium & Tournament Operations Command Center",
  description: "Next-generation enterprise AI platform for crowd intelligence, digital twins, tournament operations, and stadium analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "dark", plusJakartaSans.variable, inter.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col bg-[#080B14] text-gray-100 font-sans selection:bg-[#00E5FF]/20 selection:text-[#00E5FF]">
        <QueryProvider>
          <MotionProvider>
            {children}
          </MotionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

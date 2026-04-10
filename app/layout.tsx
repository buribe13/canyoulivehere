import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Can You Live Here?",
  description:
    "The real cost of living in America's most iconic cities — for where you are right now.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="relative min-h-full flex flex-col">
        <div style={{ isolation: "isolate" }} className="flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}

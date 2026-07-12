import type { Metadata } from "next";
import { Archivo, Newsreader, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const grotesk = Archivo({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});

const serif = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ["italic", "normal"],
  display: "swap",
});

const thai = Noto_Sans_Thai({
  subsets: ["thai"],
  variable: "--font-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Johny Memo — A private workspace, built for one person.",
  description:
    "Johny Memo is a personal operating system for tasks, notes, expenses, and daily planning — captured instantly through LINE, stored locally first, synced when you want it.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${grotesk.variable} ${serif.variable} ${thai.variable}`}>
      <body className="font-grotesk antialiased">{children}</body>
    </html>
  );
}

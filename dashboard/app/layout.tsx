import type { Metadata } from "next";
import Script from "next/script";
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
  title: "Johny Memo — Dashboard",
  description: "A private workspace for one person's tasks, notes, and money.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Johny",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon-180.png",
  },
};

export const viewport = {
  themeColor: "#c23b22",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={`${grotesk.variable} ${serif.variable} ${thai.variable}`} suppressHydrationWarning>
      <body className="font-grotesk antialiased">
        {children}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').catch(() => {});
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}

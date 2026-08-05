import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/ui/Header";
import ScoreBar from "@/components/ui/ScoreBar";

export const metadata: Metadata = {
  title: "הפעלת יום פיתוח + אורי בר מהנדס על",
  description: "הפעלה מותאמת אישית לאנשי הפיתוח, כפרה על שחר ועדי",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0F1117" />
      </head>
      <body className="bg-brand-bg text-brand-text min-h-screen antialiased">
        <Header />
        <ScoreBar />
        <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}

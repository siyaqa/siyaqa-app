import type { Metadata, Viewport } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-arabic",
});

export const metadata: Metadata = {
  title: "Siyaqi — Gérez votre auto-école depuis votre téléphone",
  description:
    "Candidats, paiements, planning, heures de conduite — tout dans une seule app. المنصة الذكية لإدارة مدرسة تعليم السياقة",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "Siyaqi — Gérez votre auto-école depuis votre téléphone",
    description:
      "Candidats, paiements, planning, heures de conduite — tout dans une seule app. Essai gratuit 30 jours.",
    siteName: "Siyaqi",
    locale: "fr_MA",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" dir="ltr">
      <body className={`${inter.className} ${cairo.variable} min-h-screen bg-background text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}

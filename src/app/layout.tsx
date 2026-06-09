import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AmbientBg } from "@/components/lab/AmbientBg";
import { Header } from "@/components/lab/Header";
import { Footer } from "@/components/lab/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"),
  ),
  title: "Viggy's AI Lab — 52 AI Experiments in 52 Weeks",
  description:
    "A living archive of weekly AI experiments, prototypes, and lessons learned by Viggy.",
  authors: [{ name: "Viggy" }],
  openGraph: {
    title: "Viggy's AI Lab",
    description:
      "Weekly AI experiments, creative prototypes, and tiny bets on the future.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <AmbientBg />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

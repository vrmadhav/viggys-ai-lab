import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
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

const satoshi = localFont({
  variable: "--font-satoshi",
  src: [
    {
      path: "../../public/fonts/satoshi/satoshi-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/satoshi/satoshi-500.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/satoshi/satoshi-700.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"),
  ),
  title: "Viggy's AI Lab — projects and experiments",
  description:
    "A living archive of small apps, prototypes, experiments, and build notes.",
  authors: [{ name: "Viggy" }],
  openGraph: {
    title: "Viggy's AI Lab",
    description:
      "Small apps, prototypes, experiments, and build notes from Viggy.",
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
    <html lang="en" className={`dark ${inter.variable} ${satoshi.variable}`}>
      <body>
        <AmbientBg />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

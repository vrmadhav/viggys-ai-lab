import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AmbientBg } from "@/components/lab/AmbientBg";
import { Header } from "@/components/lab/Header";
import { Footer } from "@/components/lab/Footer";

const themeScript = `
(() => {
  try {
    const stored = window.localStorage.getItem("lab:theme");
    const theme = stored || "dark";
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  } catch {
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
  }
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"),
  ),
  title: "Viggy's Lab — projects and experiments",
  description:
    "A living archive of small apps, prototypes, experiments, and build notes.",
  authors: [{ name: "Viggy" }],
  openGraph: {
    title: "Viggy's Lab",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <Script id="theme-script" strategy="beforeInteractive">
          {themeScript}
        </Script>
      </head>
      <body className="relative min-h-screen overflow-x-hidden isolate">
        <AmbientBg />
        <Header />
        <div className="relative z-10">
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}

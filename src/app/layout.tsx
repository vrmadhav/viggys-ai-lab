import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { AmbientBg } from "@/components/lab/AmbientBg";
import { Header } from "@/components/lab/Header";
import { Footer } from "@/components/lab/Footer";

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

const themeScript = `
(() => {
  try {
    const stored = window.localStorage.getItem("lab:theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored || (prefersDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  } catch {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
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
    <html lang="en" suppressHydrationWarning className={satoshi.variable}>
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&f[]=zodiak@400,700&display=swap"
          rel="stylesheet"
        />
        <Script id="theme-script" strategy="beforeInteractive">
          {themeScript}
        </Script>
      </head>
      <body>
        <AmbientBg />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, Space_Grotesk, Noto_Kufi_Arabic } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { Providers } from "@/components/providers";
import type { Locale } from "@/lib/types";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const kufi = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "FLUXMEDIA — AI Automation & Social Media Management",
    template: "%s | FLUXMEDIA",
  },
  description:
    "FLUXMEDIA helps businesses automate repetitive work and manage their social media presence with modern systems, AI, and strategic content.",
  openGraph: {
    type: "website",
    siteName: "FLUXMEDIA",
    title: "FLUXMEDIA — AI Automation & Social Media Management",
    description:
      "Less manual work. Better systems. Stronger online presence. AI automation and social media management for modern businesses.",
    images: [{ url: "/logo.png", width: 256, height: 256, alt: "FLUXMEDIA" }],
  },
  twitter: {
    card: "summary",
    title: "FLUXMEDIA — AI Automation & Social Media Management",
    description: "AI automation and social media management for modern businesses.",
    images: ["/logo.png"],
  },
  icons: { icon: "/favicon.png", apple: "/logo.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const store = cookies();
  const locale = (store.get("locale")?.value as Locale) || "en";
  const theme = store.get("theme")?.value === "light" ? "light" : "dark";

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      data-theme={theme}
      className={`${inter.variable} ${space.variable} ${kufi.variable}`}
      suppressHydrationWarning
    >
      <body className="overflow-x-hidden">
        <Providers locale={locale} theme={theme}>
          {children}
        </Providers>
      </body>
    </html>
  );
}

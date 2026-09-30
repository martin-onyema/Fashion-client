import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { ChatWidget } from "@/components/chat/chat-widget";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Wardrobecare Clothing — Premium Men's Fashion",
    template: "%s · Wardrobecare Clothing",
  },
  description:
    "Wardrobecare Clothing is your #1 personal shopper for premium men's fashion. Curated shirts, polos, trousers, footwear, accessories, fragrance and essentials — delivered across Nigeria.",
  keywords: [
    "Wardrobecare",
    "Wardrobecare Clothing",
    "men's fashion Nigeria",
    "premium menswear Lagos",
    "men's shirts",
    "polos",
    "trousers",
    "footwear",
    "fragrance",
    "personal shopper Nigeria",
  ],
  authors: [{ name: "Wardrobecare Clothing" }],
  creator: "Wardrobecare Clothing",
  metadataBase: new URL("https://wardrobecare.com.ng"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://wardrobecare.com.ng",
    siteName: "Wardrobecare Clothing",
    title: "Wardrobecare Clothing — Premium Men's Fashion",
    description:
      "Your #1 personal shopper for premium men's fashion. Curated menswear, delivered across Nigeria.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wardrobecare Clothing",
    description:
      "Premium men's fashion, curated for everyday confidence.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} font-body antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <ChatWidget />
        </Providers>
        <Toaster />
        <SonnerToaster position="top-center" />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MonetagScript } from "@/components/MonetagScript";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NicaFlix — Películas, Series, En Vivo y Deportes",
  description:
    "Descarga NicaFlix para Android e iOS. Streaming de películas, series, anime, TV en vivo y deportes. Plan Pro sin anuncios.",
  keywords: [
    "NicaFlix",
    "streaming",
    "películas",
    "series",
    "TV en vivo",
    "deportes",
    "Android",
    "iOS",
  ],
  openGraph: {
    title: "NicaFlix — Tu streaming en un solo lugar",
    description: "Descarga la app y disfruta contenido en vivo y bajo demanda.",
    type: "website",
    locale: "es_LA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <MonetagScript />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}

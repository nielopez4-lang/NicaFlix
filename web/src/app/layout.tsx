import type { Metadata } from "next";

import { Inter } from "next/font/google";

import "./globals.css";

import { SiteHeader } from "@/components/SiteHeader";

import { SiteFooter } from "@/components/SiteFooter";

import { MONETAG_VERIFY } from "@/lib/monetag";



const inter = Inter({ subsets: ["latin"] });



export const metadata: Metadata = {

  title: "NicaFlix — Películas, Series, En Vivo y Deportes",

  description:

    "Descarga NicaFlix para Android. Streaming gratis de películas, series, anime, TV en vivo y deportes.",

  keywords: [

    "NicaFlix",

    "streaming",

    "películas",

    "series",

    "TV en vivo",

    "deportes",

    "Android",

  ],

  openGraph: {

    title: "NicaFlix — Tu streaming en un solo lugar",

    description: "Descarga la app y disfruta contenido en vivo y bajo demanda.",

    type: "website",

    locale: "es_LA",

    images: [{ url: "/logo.png", width: 512, height: 512, alt: "NicaFlix" }],

  },

  icons: {

    icon: "/icon.png",

    apple: "/apple-touch-icon.png",

  },

  other: {

    monetag: MONETAG_VERIFY,

  },

};



export default function RootLayout({

  children,

}: Readonly<{

  children: React.ReactNode;

}>) {

  return (

    <html lang="es">

      <head>

        <meta name="monetag" content={MONETAG_VERIFY} />

      </head>

      <body className={inter.className}>

        <SiteHeader />

        {children}

        <SiteFooter />

      </body>

    </html>

  );

}



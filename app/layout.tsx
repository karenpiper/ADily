import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display, Caveat } from "next/font/google"
import "./globals.css"

const _inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const _playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
})

const _caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
})

export const metadata: Metadata = {
  title: "The ADily Dose — Social Intelligence Newsletter",
  description:
    "A weekly social intelligence and inspiration program by Amazon Ads. Memes, design, video, and articles curated for creative teams.",
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${_inter.variable} ${_playfair.variable} ${_caveat.variable} font-sans antialiased noise-bg`}
      >
        {children}
      </body>
    </html>
  )
}

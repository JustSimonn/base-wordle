import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

// ✅ import your WalletProvider here
import { WalletProvider } from "@/lib/wallet-context"

// Optional navigation and footer
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Base Wordle",
  description: "Play Wordle on the Base blockchain",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`font-sans antialiased flex flex-col min-h-screen bg-background text-foreground ${_geist.className}`}
      >
        {/* ✅ Wrap the whole app with WalletProvider */}
        <WalletProvider>
          <Navigation />
          <main className="flex-1 w-full px-4 sm:px-6 md:px-8">{children}</main>
          <Footer />
        </WalletProvider>
        <Analytics />
      </body>
    </html>
  )
}

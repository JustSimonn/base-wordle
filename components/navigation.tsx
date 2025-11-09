"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { WalletButton } from "@/components/wallet-button"

export function Navigation() {
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="text-2xl font-bold text-primary">Base Wordle</div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className={`font-medium transition-colors ${
              isActive("/") ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Home
          </Link>
          <Link
            href="/game"
            className={`font-medium transition-colors ${
              isActive("/game") ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Play
          </Link>
          <Link
            href="/leaderboard"
            className={`font-medium transition-colors ${
              isActive("/leaderboard") ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Leaderboard
          </Link>
        </div>

        {/* Wallet Button */}
        <div className="flex-shrink-0">
          <WalletButton />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-border px-4 py-3 flex justify-around">
        <Link
          href="/"
          className={`text-sm font-medium transition-colors ${
            isActive("/") ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Home
        </Link>
        <Link
          href="/game"
          className={`text-sm font-medium transition-colors ${
            isActive("/game") ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Play
        </Link>
        <Link
          href="/leaderboard"
          className={`text-sm font-medium transition-colors ${
            isActive("/leaderboard") ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Leaderboard
        </Link>
      </div>
    </nav>
  )
}

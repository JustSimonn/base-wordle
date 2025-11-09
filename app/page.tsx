import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WalletButton } from "@/components/wallet-button" // ✅ Wallet button import

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Base Wordle UI */}
        <div className="space-y-2">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">
            Base Wordle
          </h1>
          <p className="text-lg text-muted-foreground">
            A fun daily word guessing game built on the Base blockchain.
          </p>
        </div>

        {/* 👇 Wallet Connect Button Section */}
        <div className="flex justify-center mt-4">
          <WalletButton />
        </div>

        {/* Game Description */}
        <div className="bg-card border border-border rounded-lg p-8 space-y-4">
          <p className="text-foreground text-lg leading-relaxed">
            Play daily word challenges, earn points, and build your streak.
            Compete with players worldwide on the leaderboard and showcase your
            word-guessing skills on the Base blockchain.
          </p>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 space-y-3">
            <h3 className="font-semibold text-foreground text-left">
              Getting Started
            </h3>
            <p className="text-sm text-muted-foreground text-left">
              To get started, deposit a small amount of Base ETH (around $0.50–$1 worth)
              to cover your gas while playing. It’s your fuel for guesses — and you’ll
              only use tiny bits as you play!
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-6 space-y-2">
            <div className="text-3xl font-bold text-primary">5x6</div>
            <p className="text-sm text-muted-foreground">Grid Layout</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 space-y-2">
            <div className="text-3xl font-bold text-primary">∞</div>
            <p className="text-sm text-muted-foreground">Daily Challenges</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 space-y-2">
            <div className="text-3xl font-bold text-primary">🏆</div>
            <p className="text-sm text-muted-foreground">Leaderboard</p>
          </div>
        </div>

        {/* CTA Button */}
        <Link href="/game" className="inline-block w-full md:w-auto mr-4">
          <Button
            size="lg"
            className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-8 py-6 rounded-lg transition-all hover:shadow-lg"
          >
            Start Playing
          </Button>
        </Link>

        <Link href="/leaderboard" className="inline-block mt-12">
          <button className="text-primary hover:text-primary/80 font-medium transition-colors">
            View Leaderboard →
          </button>
        </Link>
      </div>
    </main>
  )
}

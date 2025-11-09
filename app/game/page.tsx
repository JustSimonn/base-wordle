"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WordleGame } from "@/components/game/wordle-game";
import { useWallet } from "@/lib/wallet-context";
import { PlayerStats } from "@/components/player-stats";
import { DepositPrompt } from "@/components/game/deposit-prompt";
import { BalanceDisplay } from "@/components/game/balance-display";

export default function GamePage() {
  const { isConnected, balance, playerStats, refreshPlayerStats } = useWallet();
  const [hydrated, setHydrated] = useState(false);
  const [showDepositPrompt, setShowDepositPrompt] = useState(true);

  // Client hydration
  useEffect(() => setHydrated(true), []);

  // Prevent Enter key from scrolling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") e.preventDefault();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);


  // Game complete handler
  const handleGameComplete = async () => {
    try {
      await refreshPlayerStats(); // fetch latest leaderboard stats including wins and streak
    } catch {
      // ignore errors silently (network switch etc.)
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4 py-8">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/">
            <Button variant="ghost">← Home</Button>
          </Link>

          <h1 className="text-3xl font-bold text-foreground text-center">
            Play Base Wordle
          </h1>

          <Link href="/leaderboard">
            <Button variant="ghost">Leaderboard →</Button>
          </Link>
        </div>

        {isConnected ? (
          <>
            <PlayerStats />

            <BalanceDisplay />

            {showDepositPrompt && (
              <DepositPrompt onDismiss={() => setShowDepositPrompt(false)} />
            )}

            <div className="space-y-6">
              <WordleGame requireWalletToPlay={true} onGameComplete={handleGameComplete} />
              <p className="text-sm text-muted-foreground text-center">
                Use your keyboard or click letters to guess the word. Gas is only used
                when saving scores on-chain.
              </p>
            </div>
          </>
        ) : (
          <p className="text-center text-muted-foreground text-lg mt-8">
            Please connect your wallet using the button on the navbar to start playing.
          </p>
        )}
      </div>
    </main>
  );
}
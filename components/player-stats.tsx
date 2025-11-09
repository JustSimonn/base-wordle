"use client"

import { useWallet } from "@/lib/wallet-context"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

export function PlayerStats() {
  const { isConnected, playerStats } = useWallet()

  if (!isConnected) {
    return null
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="p-4 space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Wins</p>
        <p className="text-2xl font-bold text-primary">
          {playerStats ? (
            playerStats.wins
          ) : (
            <span className="inline-flex items-center gap-2"><Spinner /> Loading</span>
          )}
        </p>
      </Card>

      <Card className="p-4 space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Total Games</p>
        <p className="text-2xl font-bold text-foreground">{playerStats ? playerStats.totalGames : "—"}</p>
      </Card>

      <Card className="p-4 space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Streak</p>
        <p className="text-2xl font-bold text-primary">
          🔥 {playerStats ? (
            playerStats.currentStreak
          ) : (
            <span className="inline-flex items-center gap-2"><Spinner /> Loading</span>
          )}
        </p>
      </Card>

      {/* Changed from Total Earnings → Total Points */}
      <Card className="p-4 space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Total Points</p>
        <p className="text-2xl font-bold text-primary">{playerStats ? (playerStats.totalPoints ?? 0) : "—"}</p>
      </Card>
    </div>
  )
}
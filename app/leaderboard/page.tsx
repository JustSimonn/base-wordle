"use client"

import { useEffect, useState } from "react"
import { LeaderboardTable } from "@/components/leaderboard-table"
import { getLeaderboard } from "@/lib/contract"  // ✅ notice the correct import
import { Card } from "@/components/ui/card"

interface LeaderboardEntry {
  rank: number
  walletAddress: string
  totalPoints: number
  totalGames: number
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalGames, setTotalGames] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)

  useEffect(() => {
    const sdkWin = (window as any).sdk
    if (sdkWin?.actions?.ready) {
      try { sdkWin.actions.ready() } catch {}
    }
  }, [])

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const data = await getLeaderboard()
        const mapped = data.map((p: any, i: number) => ({
          rank: i + 1,
          walletAddress: p.address,
          totalPoints: p.totalScore,
          totalGames: p.totalGames,
        }))
        setEntries(mapped)
        
        // Calculate totals
        const totalGamesCount = data.reduce((sum: number, p: any) => sum + p.totalGames, 0)
        const totalPointsCount = data.reduce((sum: number, p: any) => sum + p.totalScore, 0)
        setTotalGames(totalGamesCount)
        setTotalPoints(totalPointsCount)
      } catch (err: any) {
        console.error("Leaderboard error:", err)
        setError(err?.message || "Failed to load leaderboard")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center justify-start px-4 py-12">
      <div className="w-full max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
          <p className="text-sm text-muted-foreground">Top players on Base Mainnet</p>
        </div>

        {/* Global Stats Dashboard */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-6 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Total Players</p>
            <p className="text-3xl font-bold text-primary">
              {loading ? "—" : entries.length.toLocaleString()}
            </p>
          </Card>
          <Card className="p-6 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Total Games Played</p>
            <p className="text-3xl font-bold text-primary">
              {loading ? "—" : totalGames.toLocaleString()}
            </p>
          </Card>
          <Card className="p-6 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Total Points</p>
            <p className="text-3xl font-bold text-primary">
              {loading ? "—" : totalPoints.toLocaleString()}
            </p>
          </Card>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          {loading ? (
            <p className="text-center text-muted-foreground">Loading leaderboard…</p>
          ) : error ? (
            <p className="text-center text-destructive">Error: {error}</p>
          ) : entries.length === 0 ? (
            <p className="text-center text-muted-foreground">No leaderboard data yet.</p>
          ) : (
            <LeaderboardTable players={entries} />
          )}
        </div>
      </div>
    </main>
  )
}
"use client"

import { useState, useEffect } from "react"

export interface UserStats {
  walletAddress: string
  username?: string
  ethBalance: string
  totalPoints: number
  currentStreak: number
  longestStreak: number
  playedToday: boolean
  todayScore?: {
    points_earned: number
    attempts: number
    gas_used: string
  }
}

export function useUserStats(walletAddress: string | null) {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!walletAddress) {
      setStats(null)
      return
    }

    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/user/stats?address=${walletAddress}`)

        if (!response.ok) {
          throw new Error("Failed to fetch user stats")
        }

        const data = await response.json()
        setStats(data.stats)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setStats(null)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [walletAddress])

  return { stats, loading, error }
}

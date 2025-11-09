"use client";

import { useEffect, useState } from "react";
import { getContract } from "@/lib/contract";

export interface LeaderboardEntry {
  rank: number;
  walletAddress: string;
  username?: string;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
}

export function useLeaderboard(limit = 10) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const contract = getContract();
        if (!contract) throw new Error("Blockchain not available");

        const players = await contract.getLeaderboard();

        // 🧮 Format and sort
        const formatted = players
          .map((p: any, index: number) => ({
            rank: index + 1,
            walletAddress: p.wallet,
            totalPoints: Number(p.totalPoints),
            currentStreak: Number(p.currentStreak),
            longestStreak: Number(p.longestStreak),
          }))
          .sort((a, b) => b.totalPoints - a.totalPoints)
          .slice(0, limit);

        setLeaderboard(formatted);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [limit]);

  return { leaderboard, loading, error };
}

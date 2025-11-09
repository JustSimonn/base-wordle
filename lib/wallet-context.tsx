"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { getPlayerStats, getPlayerEvents as fetchPlayerEvents } from "./contract";

interface PlayerStats {
  address: string;
  wins: number;
  totalGames: number;
  currentStreak: number;
  totalPoints: number;
  lastScore: number;
  balance: string;
}

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  playerStats: PlayerStats | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  updatePlayerStats: (stats: Partial<PlayerStats>) => void;
  refreshPlayerStats: () => Promise<void>;
  provider: ethers.BrowserProvider | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [providers6963, setProviders6963] = useState<Array<{ info: any; provider: any }>>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const announced: Array<{ info: any; provider: any }> = [];

    const onAnnounce = (event: any) => {
      try {
        if (event?.detail?.provider) announced.push(event.detail);
      } catch {}
    };

    try {
      window.addEventListener("eip6963:announceProvider", onAnnounce);
      window.dispatchEvent(new Event("eip6963:requestProvider"));
    } catch {}

    const multi = (window as any).ethereum?.providers || [];
    if (multi.length) {
      for (const p of multi) {
        announced.push({ info: { name: p?.name || "Injected" , rdns: "" }, provider: p });
      }
    } else if ((window as any).ethereum) {
      announced.push({ info: { name: "Injected Provider", rdns: "" }, provider: (window as any).ethereum });
    }

    setProviders6963(announced);

    const valid = announced.filter((p) => p?.provider && typeof p.provider.request === "function");

    const preferred =
      valid.find((p) => /warpcast|farcaster/i.test(p.info?.name || "") || /warpcast|farcaster/i.test(p.info?.rdns || ""))?.provider ||
      valid.find((p) => p.provider?.isCoinbaseWallet)?.provider ||
      valid[0]?.provider;

    if (preferred) {
      try {
        setProvider(new ethers.BrowserProvider(preferred));
      } catch {}
    }

    return () => {
      try {
        window.removeEventListener("eip6963:announceProvider", onAnnounce);
      } catch {}
    };
  }, []);

  // ------------------ CONNECT WALLET ------------------ //
  const connectWallet = useCallback(async () => {
    try {
      // If we already have a BrowserProvider, reuse it
      let newProvider: ethers.BrowserProvider | null = provider;

      // Build candidate list if provider missing
      if (!newProvider) {
        const candidates: Array<any> = [];

        // EIP-6963 announced providers
        for (const p of providers6963) candidates.push(p.provider);

        // Multiple injected providers
        const multi = (window as any)?.ethereum?.providers || [];
        for (const p of multi) candidates.push(p);

        // Single injected provider
        if ((window as any)?.ethereum) candidates.push((window as any).ethereum);

        // Filter to valid EIP-1193 providers
        const valid = candidates.filter((p) => p && typeof p.request === "function");

        // Prefer Farcaster/Warpcast, then Coinbase, else first valid
        const farcaster = providers6963.find((p) => /warpcast|farcaster/i.test(p.info?.name || "") || /warpcast|farcaster/i.test(p.info?.rdns || ""))?.provider;
        const coinbase = valid.find((p) => p.isCoinbaseWallet);
        const chosen = (farcaster && typeof farcaster.request === "function" ? farcaster : null) || coinbase || valid[0] || null;

        if (!chosen) throw new Error("No wallet provider found");

        newProvider = new ethers.BrowserProvider(chosen);
        setProvider(newProvider);
      }

      // Request accounts through the provider
      const accounts = await newProvider!.send("eth_requestAccounts", []);
      const walletAddress = accounts[0];
      setAddress(walletAddress);

      const balanceWei = await newProvider!.getBalance(walletAddress);
      const balanceEth = ethers.formatEther(balanceWei);
      setBalance(balanceEth);

      setIsConnected(true);

      await refreshPlayerStats(walletAddress, balanceEth);
      fetchEventsStats(walletAddress, balanceEth);
    } catch (error) {
      console.error("Wallet connection error:", error);
      alert("Failed to connect wallet. Check console for details.");
    }
  }, [providers6963, provider]);

  // ------------------ DISCONNECT WALLET ------------------ //
  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setAddress(null);
    setBalance(null);
    setPlayerStats(null);
  }, []);

  // ------------------ UPDATE PLAYER STATS ------------------ //
  const updatePlayerStats = useCallback((stats: Partial<PlayerStats>) => {
    setPlayerStats((prev) => (prev ? { ...prev, ...stats } : null));
  }, []);

  // ------------------ REFRESH PLAYER STATS ------------------ //
  const refreshPlayerStats = useCallback(
    async (addr?: string, bal?: string) => {
      const playerAddr = addr || address;
      const currentBalance = bal || balance || "0";
      if (!playerAddr) return;

      try {
        const statsFromContract = await getPlayerStats(playerAddr);

        let totalGames = Number(statsFromContract.totalGames) ?? 0;
        let wins = 0;
        let streak = 0;

        try {
          const events = await fetchPlayerEvents(playerAddr);
          totalGames = events.length;
          wins = events.filter((e: any) => Number(e.score) > 1).length;
          for (let i = events.length - 1; i >= 0; i--) {
            if (Number(events[i].score) > 1) streak++;
            else break;
          }
        } catch (e) {
          // fallback: rely on contract totals
        }

        setPlayerStats({
          address: playerAddr,
          totalGames,
          totalPoints: Number(statsFromContract.totalScore) ?? 0,
          lastScore: Number(statsFromContract.lastScore) ?? 0,
          balance: currentBalance,
          wins,
          currentStreak: streak
        });
      } catch (err: any) {
        console.error("Failed to refresh player stats:", err);
      }
    },
    [address, balance]
  );

  // ------------------ FETCH PLAYER EVENTS FOR WINS/LOSSES/STREAK ------------------ //
  const fetchEventsStats = useCallback(
    async (addr?: string, bal?: string) => {
      const playerAddr = addr || address;
      const currentBalance = bal || balance || "0";
      if (!playerAddr) return;

      try {
        const events = await fetchPlayerEvents(playerAddr);

        // ✅ Compute wins and losses
        const totalGames = events.length;
        const wins = events.filter((e) => e.score > 1).length; // treat score > 1 as win

        // ✅ Compute streak: counts consecutive wins until a loss
        let streak = 0;
        for (let i = events.length - 1; i >= 0; i--) {
          if (events[i].score > 1) streak++;
          else break;
        }

        // ✅ Total points (sum of all scores)
        const totalPoints = events.reduce((acc, e) => acc + Number(e.score), 0);

        setPlayerStats({
          address: playerAddr,
          totalGames,
          totalPoints,
          lastScore: events.length ? events[events.length - 1].score : 0,
          balance: currentBalance,
          wins,
          currentStreak: streak
        });
      } catch (err) {
        console.error("Failed to fetch player event stats:", err);
      }
    },
    [address, balance]
  );

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        balance,
        playerStats,
        connectWallet,
        disconnectWallet,
        updatePlayerStats,
        refreshPlayerStats,
        provider
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// ------------------ CUSTOM HOOK ------------------ //
export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used within WalletProvider");
  return context;
}
"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { getPlayerStats, getPlayerEvents as fetchPlayerEvents } from "./contract";
import { sdk } from "@farcaster/miniapp-sdk";

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

    (async () => {
      const announced: Array<{ info: any; provider: any }> = [];

      // Check if we're in a Farcaster environment first
      const isInFarcaster = typeof (window as any).sdk !== "undefined" || 
                            typeof (window as any).farcaster !== "undefined";

      // Try Farcaster Mini App provider ONLY if in Farcaster environment
      if (isInFarcaster) {
        try {
          const sdkWin = (window as any).sdk;
          if (sdkWin?.wallet?.getEthereumProvider) {
            const mini = await sdkWin.wallet.getEthereumProvider();
            if (mini && typeof mini.request === "function") {
              // Validate the provider works before adding
              try {
                await mini.request({ method: "eth_chainId" });
                announced.push({ info: { name: "Farcaster MiniApp", rdns: "farcaster.miniapp" }, provider: mini });
                console.log("✅ Farcaster wallet provider detected");
              } catch (validationError) {
                console.warn("Farcaster provider validation failed:", validationError);
              }
            }
          }
        } catch (error) {
          console.warn("Farcaster SDK not available:", error);
        }
      }

      // EIP-6963 providers (modern wallet detection)
      const onAnnounce = (event: any) => {
        try {
          if (event?.detail?.provider && typeof event.detail.provider.request === "function") {
            announced.push(event.detail);
          }
        } catch {}
      };

      try {
        window.addEventListener("eip6963:announceProvider", onAnnounce);
        window.dispatchEvent(new Event("eip6963:requestProvider"));
        // Give EIP-6963 providers time to announce
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch {}

      // Legacy injected providers (MetaMask, Coinbase Wallet, etc.)
      const multi = (window as any).ethereum?.providers || [];
      if (multi.length) {
        for (const p of multi) {
          if (p && typeof p.request === "function") {
            announced.push({ info: { name: p?.name || "Injected" , rdns: "" }, provider: p });
          }
        }
      } else if ((window as any).ethereum && typeof (window as any).ethereum.request === "function") {
        announced.push({ info: { name: "Injected Provider", rdns: "" }, provider: (window as any).ethereum });
      }

      console.log(`🔍 Found ${announced.length} wallet provider(s):`, announced.map(a => a.info?.name));

      setProviders6963(announced);

      const valid = announced.filter((p) => p?.provider && typeof p.provider.request === "function");

      // Priority: Farcaster (when in Farcaster) > Coinbase Wallet > First available
      let preferred = null;
      if (isInFarcaster) {
        preferred = valid.find((p) => /warpcast|farcaster/i.test(p.info?.name || "") || /warpcast|farcaster/i.test(p.info?.rdns || ""))?.provider;
      }
      if (!preferred) {
        preferred = valid.find((p) => p.provider?.isCoinbaseWallet)?.provider || valid[0]?.provider;
      }

      if (preferred) {
        try {
          setProvider(new ethers.BrowserProvider(preferred));
          console.log(`✅ Auto-selected wallet provider: ${valid.find(v => v.provider === preferred)?.info?.name}`);
        } catch (err) {
          console.error("Failed to create BrowserProvider:", err);
        }
      } else {
        console.warn("⚠️ No wallet providers found. Please install MetaMask, Coinbase Wallet, or open in Warpcast.");
      }

      return () => {
        try {
          window.removeEventListener("eip6963:announceProvider", onAnnounce);
        } catch {}
      };
    })();
  }, []);

  // ------------------ CONNECT WALLET ------------------ //
  const connectWallet = useCallback(async () => {
    try {
      // If we already have a BrowserProvider, reuse it
      let newProvider: ethers.BrowserProvider | null = provider;

      // Build candidate list if provider missing
      if (!newProvider) {
        const candidates: Array<any> = [];
        const isInFarcaster = typeof (window as any).sdk !== "undefined" || 
                              typeof (window as any).farcaster !== "undefined";

        // EIP-6963 announced providers
        for (const p of providers6963) {
          if (p?.provider && typeof p.provider.request === "function") {
            candidates.push(p.provider);
          }
        }

        // Multiple injected providers
        const multi = (window as any)?.ethereum?.providers || [];
        for (const p of multi) {
          if (p && typeof p.request === "function") {
            candidates.push(p);
          }
        }

        // Single injected provider
        if ((window as any)?.ethereum && typeof (window as any).ethereum.request === "function") {
          candidates.push((window as any).ethereum);
        }

        // Filter to valid EIP-1193 providers
        const valid = candidates.filter((p) => p && typeof p.request === "function");

        if (valid.length === 0) {
          throw new Error("No wallet found. Please install MetaMask, Coinbase Wallet, or open in Warpcast.");
        }

        // Prefer Farcaster/Warpcast ONLY when in Farcaster, then Coinbase, else first valid
        let chosen = null;
        if (isInFarcaster) {
          const farcaster = providers6963.find((p) => /warpcast|farcaster/i.test(p.info?.name || "") || /warpcast|farcaster/i.test(p.info?.rdns || ""))?.provider;
          if (farcaster && typeof farcaster.request === "function") {
            chosen = farcaster;
          }
        }
        if (!chosen) {
          chosen = valid.find((p) => p.isCoinbaseWallet) || valid[0];
        }

        console.log(`🔗 Connecting to wallet...`);
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
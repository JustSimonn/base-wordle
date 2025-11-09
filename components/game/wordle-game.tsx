"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ethers } from "ethers"
import { useWallet } from "@/lib/wallet-context"
import { getPlayerStats, getPlayerEvents } from "@/lib/contract" // ✅ Correct path
import { getRandomWord } from "@/lib/word-list"

type Props = {
  requireWalletToPlay?: boolean
  onGameComplete?: () => void
}

const WORD_LENGTH = 5
const MAX_ROUNDS = 6
const pickWord = (exclude?: string) => {
  let w = getRandomWord()
  if (exclude) {
    let attempts = 0
    while (w === exclude && attempts < 10) {
      w = getRandomWord()
      attempts++
    }
  }
  return w
}

export function WordleGame({ requireWalletToPlay = false, onGameComplete }: Props) {
  const { isConnected, connectWallet, refreshPlayerStats, provider, updatePlayerStats, playerStats } = useWallet()

  const [target, setTarget] = useState<string>(() => pickWord())
  const [guesses, setGuesses] = useState<string[]>([])
  const [current, setCurrent] = useState("")
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing")
  const [message, setMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const CONTRACT_ADDRESS = "0x5dd73a2455dda3d3e30672aa77ece3747d4904e7"
  const CONTRACT_ABI = [
    "function saveScore(uint256 score) payable",
    "function getLeaderboard() external view returns (address[] memory, uint256[] memory, uint256[] memory)",
    "function getPlayerStats(address playerAddr) external view returns (uint256 totalGames, uint256 totalScore, uint256 lastScore)",
    "function devFeeWei() view returns (uint256)"
  ]

  // ======== RESET CURRENT GUESS AFTER WIN/LOSS ========
  useEffect(() => {
    if (status !== "playing") setCurrent("")
  }, [status])

  // ======== KEYBOARD INPUT HANDLING ========
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (status !== "playing") return
      const key = e.key.toUpperCase()
      if (key === "BACKSPACE") setCurrent((c) => c.slice(0, -1))
      else if (key === "ENTER") onSubmitGuess()
      else if (/^[A-Z]$/.test(key) && current.length < WORD_LENGTH)
        setCurrent((c) => (c + key).slice(0, WORD_LENGTH))
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [current, status])

  // ======== GUESS SUBMISSION ========
  const onSubmitGuess = () => {
    if (status !== "playing") return
    if (current.length !== WORD_LENGTH) {
      setMessage(`Guess must be ${WORD_LENGTH} letters`)
      return
    }
    const newGuesses = [...guesses, current]
    setGuesses(newGuesses)
    setCurrent("")
    setMessage(null)

    if (current === target) setStatus("won")
    else if (newGuesses.length >= MAX_ROUNDS) setStatus("lost")
  }

  const handleKeyClick = (k: string) => {
    if (status !== "playing") return
    if (k === "ENTER") onSubmitGuess()
    else if (k === "BACK") setCurrent((s) => s.slice(0, -1))
    else if (current.length < WORD_LENGTH)
      setCurrent((s) => (s + k).slice(0, WORD_LENGTH))
  }

  const getFeedback = (guess: string) => {
    const res: ("correct" | "present" | "absent")[] = Array(WORD_LENGTH).fill("absent")
    const targetChars = target.split("")
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guess[i] === target[i]) {
        res[i] = "correct"
        targetChars[i] = "_"
      }
    }
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (res[i] === "correct") continue
      const idx = targetChars.indexOf(guess[i])
      if (idx >= 0) {
        res[i] = "present"
        targetChars[idx] = "_"
      }
    }
    return res
  }

  const calcPoints = () => {
    if (status !== "won") return 0
    const rounds = guesses.length
    return Math.max(100 - rounds * 10, 10)
  }

  // ======== BLOCKCHAIN HELPERS ========
  const getProviderAndContract = async () => {
    const baseMainnetChainId = BigInt("8453");
    const eth = (window as any).ethereum;
    
    if (!eth) throw new Error("No wallet found");

    // Switch network first before creating provider
    try {
      const currentChainId = await eth.request({ method: "eth_chainId" });
      if (currentChainId !== "0x2105") {
        await eth.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x2105" }],
        });
      }
    } catch (switchErr: any) {
      // If chain doesn't exist, add it
      if (switchErr.code === 4902) {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: "0x2105",
            chainName: "Base Mainnet",
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: ["https://base.llamarpc.com"],
            blockExplorerUrls: ["https://basescan.org"]
          }]
        });
      } else {
        throw switchErr;
      }
    }

    // Create fresh provider after network switch
    const currentProvider = new ethers.BrowserProvider(eth);
    const signer = await currentProvider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    return { contract };
  }

  const saveScoreOnchain = async (points: number) => {
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(null)
    try {
      if (!isConnected) throw new Error("Wallet not connected")
      const { contract } = await getProviderAndContract()

      const finalScore = points > 0 ? points : 1
      const won = points > 0

      // Optimistic local stats update for instant UI feedback
      const prev = playerStats || { wins: 0, totalGames: 0, currentStreak: 0, totalPoints: 0, lastScore: 0, address: "", balance: "" }
      const nextWins = prev.wins + (won ? 1 : 0)
      const nextGames = prev.totalGames + 1
      const nextStreak = won ? prev.currentStreak + 1 : 0
      const nextPoints = (prev.totalPoints || 0) + finalScore
      updatePlayerStats({
        wins: nextWins,
        totalGames: nextGames,
        currentStreak: nextStreak,
        totalPoints: nextPoints,
        lastScore: finalScore,
      })

      const fee = await contract.devFeeWei()
      const tx = await contract.saveScore(finalScore, { value: fee })
      await tx.wait()

      setSaveSuccess("✅ Score saved successfully!")
      window.dispatchEvent(new CustomEvent("refreshLeaderboard"))

      // Notify page and refresh to confirm from chain
      if (typeof onGameComplete === "function") {
        try { await onGameComplete() } catch {}
      } else {
        await refreshPlayerStats()
      }
    } catch (err: any) {
      console.error("Save failed:", err)
      
      // Check for insufficient funds/gas errors
      const isInsufficientFunds = 
        err.code === "INSUFFICIENT_FUNDS" ||
        err.code === -32000 ||
        err.message?.toLowerCase().includes("insufficient funds") ||
        err.message?.toLowerCase().includes("insufficient balance") ||
        err.message?.toLowerCase().includes("gas");
      
      if (isInsufficientFunds) {
        // Try to extract needed amount from error message
        const wantMatch = err.info?.error?.message?.match(/want (\d+)/);
        const haveMatch = err.info?.error?.message?.match(/have (\d+)/);
        
        if (wantMatch && haveMatch) {
          const want = BigInt(wantMatch[1]);
          const have = BigInt(haveMatch[1]);
          const needed = want - have;
          const neededEth = (Number(needed) / 1e18).toFixed(6);
          setSaveError(`❌ Not enough ETH. You need ${neededEth} more ETH to cover gas + dev fee. Please add funds to your wallet.`);
        } else {
          setSaveError("❌ Not enough ETH for gas + dev fee. Please add funds to your wallet.");
        }
      } else {
        setSaveError(err.message || "Failed to save score");
      }
      
      // Re-sync from chain if optimistic update doesn't match
      try { await refreshPlayerStats() } catch {}
    } finally {
      setSaving(false)
    }
  }

  // ======== AUTO SAVE WHEN GAME ENDS ========
  useEffect(() => {
    if (status !== "playing" && isConnected) {
      const scoreToSave = status === "won" ? calcPoints() : 1
      saveScoreOnchain(scoreToSave)
    }
  }, [status, isConnected])

  // ======== UI ========
  if (requireWalletToPlay && !isConnected) {
    return (
      <div className="flex flex-col items-center mt-20 space-y-4">
        <h2 className="text-lg font-semibold">Connect Wallet to Play</h2>
        <Button onClick={connectWallet}>Connect Wallet</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Game Info */}
      <div className="flex justify-between items-center w-full max-w-md">
        <div className="text-sm text-muted-foreground">
          Rounds: {guesses.length}/{MAX_ROUNDS}
        </div>
        <div className="text-sm font-semibold text-foreground">
          Points: {calcPoints()}
        </div>
      </div>

      {/* Word Grid */}
      <div className="grid gap-2">
        {Array.from({ length: MAX_ROUNDS }).map((_, rowIdx) => {
          const guess =
            guesses[rowIdx] ||
            (rowIdx === guesses.length ? current.padEnd(WORD_LENGTH, " ") : "")
          const feedback = guesses[rowIdx] ? getFeedback(guess) : []
          return (
            <div key={rowIdx} className="flex gap-2 justify-center">
              {Array.from({ length: WORD_LENGTH }).map((__, colIdx) => {
                const char = (guess[colIdx] || " ").toUpperCase()
                const className = guesses[rowIdx]
                  ? feedback[colIdx] === "correct"
                    ? "bg-green-600 text-white"
                    : feedback[colIdx] === "present"
                    ? "bg-yellow-400 text-black"
                    : "bg-gray-400 text-white"
                  : "bg-card text-foreground"
                return (
                  <div
                    key={colIdx}
                    className={`w-12 h-12 flex items-center justify-center rounded-md font-bold ${className}`}
                  >
                    {char.trim()}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {message && <div className="text-yellow-600 mt-3">{message}</div>}

      {/* Keyboard */}
      <div className="mt-4 space-y-2">
        {["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"].map((row, i) => (
          <div key={i} className="flex justify-center gap-1 flex-wrap">
            {i === 2 && (
              <button
                onClick={() => handleKeyClick("ENTER")}
                className="px-3 py-1 rounded-md border"
              >
                ENTER
              </button>
            )}
            {row.split("").map((k) => (
              <button
                key={k}
                onClick={() => handleKeyClick(k)}
                className="px-2 py-1 rounded-md border"
              >
                {k}
              </button>
            ))}
            {i === 2 && (
              <button
                onClick={() => handleKeyClick("BACK")}
                className="px-3 py-1 rounded-md border"
              >
                BACK
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Submit Guess */}
      <div className="mt-4 flex gap-2 items-center">
        <div className="font-mono">{current}</div>
        <Button onClick={onSubmitGuess} disabled={status !== "playing"}>
          Submit
        </Button>
      </div>

      {/* Results & Save Score */}
      {status !== "playing" && (
        <div className="mt-6 text-center space-y-3">
          {status === "won" ? (
            <div className="text-green-600 font-bold">
              You won! +{calcPoints()} pts
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-red-600 font-bold">Game Over</div>
              <div className="text-muted-foreground text-sm">
                The word was: <span className="font-bold text-foreground">{target}</span>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-3 mt-2">
            <Button
              onClick={() => {
                setGuesses([])
                setCurrent("")
                setStatus("playing")
                setMessage(null)
                setSaveError(null)
                setSaveSuccess(null)
                setTarget(pickWord(target))
              }}
              disabled={saving}
            >
              {saving ? "Saving..." : "Play Again"}
            </Button>
          </div>

          {saveSuccess && <div className="text-green-600 font-semibold">{saveSuccess}</div>}
          {saveError && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-600 font-semibold">
              {saveError}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
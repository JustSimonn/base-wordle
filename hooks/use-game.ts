"use client"

import { useState, useCallback, useEffect } from "react"
import { getWordOfDay } from "@/lib/word-list"
import { GAME_CONFIG } from "@/lib/config"

export interface GameState {
  word: string
  guesses: string[]
  feedback: Array<Array<"correct" | "present" | "absent">>
  gameStatus: "playing" | "won" | "lost"
  attempts: number
  points: number
}

export function useGame() {
  const [gameState, setGameState] = useState<GameState>({
    word: "",
    guesses: [],
    feedback: [],
    gameStatus: "playing",
    attempts: 0,
    points: 0,
  })

  // Initialize game on mount
  useEffect(() => {
    const word = getWordOfDay()
    setGameState((prev) => ({
      ...prev,
      word,
    }))
  }, [])

  const makeGuess = useCallback(
    async (guess: string) => {
      if (gameState.gameStatus !== "playing" || guess.length !== GAME_CONFIG.WORD_LENGTH) {
        return
      }

      try {
        const response = await fetch("/api/game/word", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            guess,
            walletAddress: "", // Will be passed from component
          }),
        })

        const data = await response.json()

        const newGuesses = [...gameState.guesses, guess]
        const newFeedback = [...gameState.feedback, data.feedback]
        const isWon = data.isCorrect
        const isLost = newGuesses.length >= GAME_CONFIG.MAX_ATTEMPTS && !isWon

        const points = isWon ? GAME_CONFIG.POINTS_PER_WIN * (GAME_CONFIG.MAX_ATTEMPTS - newGuesses.length + 1) : 0

        setGameState({
          word: gameState.word,
          guesses: newGuesses,
          feedback: newFeedback,
          gameStatus: isWon ? "won" : isLost ? "lost" : "playing",
          attempts: newGuesses.length,
          points,
        })
      } catch (error) {
        console.error("Guess error:", error)
      }
    },
    [gameState],
  )

  const resetGame = useCallback(() => {
    const word = getWordOfDay()
    setGameState({
      word,
      guesses: [],
      feedback: [],
      gameStatus: "playing",
      attempts: 0,
      points: 0,
    })
  }, [])

  return {
    ...gameState,
    makeGuess,
    resetGame,
  }
}

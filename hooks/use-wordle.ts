"use client"

import { useState, useCallback, useEffect } from "react"

const WORD_LIST = [
  "REACT",
  "VERCEL",
  "DEPLOY",
  "BLOCKCHAIN",
  "CRYPTO",
  "WALLET",
  "TOKEN",
  "STAKE",
  "YIELD",
  "FORGE",
  "BUILD",
  "SCALE",
  "CHAIN",
  "SMART",
  "AUDIT",
  "VAULT",
  "TRADE",
  "FLASH",
  "MERGE",
  "LAYER",
]

export type LetterStatus = "correct" | "present" | "absent" | "empty"

export interface GuessLetter {
  letter: string
  status: LetterStatus
}

export interface Guess {
  letters: GuessLetter[]
}

export interface UseWordleReturn {
  guesses: Guess[]
  currentGuess: string
  gameStatus: "playing" | "won" | "lost"
  targetWord: string
  addLetter: (letter: string) => void
  removeLetter: () => void
  submitGuess: () => void
  resetGame: () => void
  getLetterStatus: (letter: string) => LetterStatus
}

export function useWordle(): UseWordleReturn {
  const [targetWord, setTargetWord] = useState<string>("")
  const [guesses, setGuesses] = useState<Guess[]>([])
  const [currentGuess, setCurrentGuess] = useState<string>("")
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing")

  // Initialize game with random word
  useEffect(() => {
    const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]
    setTargetWord(randomWord)
  }, [])

  const addLetter = useCallback(
    (letter: string) => {
      if (currentGuess.length < 5 && gameStatus === "playing") {
        setCurrentGuess((prev) => prev + letter.toUpperCase())
      }
    },
    [currentGuess.length, gameStatus],
  )

  const removeLetter = useCallback(() => {
    setCurrentGuess((prev) => prev.slice(0, -1))
  }, [])

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== 5 || gameStatus !== "playing") return

    const newGuess: Guess = {
      letters: currentGuess.split("").map((letter, index) => {
        let status: LetterStatus = "absent"

        if (targetWord[index] === letter) {
          status = "correct"
        } else if (targetWord.includes(letter)) {
          status = "present"
        }

        return { letter, status }
      }),
    }

    const newGuesses = [...guesses, newGuess]
    setGuesses(newGuesses)

    // Check win condition
    if (currentGuess === targetWord) {
      setGameStatus("won")
    } else if (newGuesses.length === 6) {
      setGameStatus("lost")
    }

    setCurrentGuess("")
  }, [currentGuess, guesses, gameStatus, targetWord])

  const resetGame = useCallback(() => {
    const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]
    setTargetWord(randomWord)
    setGuesses([])
    setCurrentGuess("")
    setGameStatus("playing")
  }, [])

  const getLetterStatus = useCallback(
    (letter: string): LetterStatus => {
      for (const guess of guesses) {
        for (const guessLetter of guess.letters) {
          if (guessLetter.letter === letter) {
            if (guessLetter.status === "correct") return "correct"
            if (guessLetter.status === "present") return "present"
          }
        }
      }
      return "absent"
    },
    [guesses],
  )

  return {
    guesses,
    currentGuess,
    gameStatus,
    targetWord,
    addLetter,
    removeLetter,
    submitGuess,
    resetGame,
    getLetterStatus,
  }
}

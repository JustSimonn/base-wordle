"use client"

import { GAME_CONFIG } from "@/lib/config"

interface WordleGridProps {
  guesses: string[]
  feedback: Array<Array<"correct" | "present" | "absent">>
  currentGuess: string
  word: string
}

export function WordleGrid({ guesses, feedback, currentGuess, word }: WordleGridProps) {
  const rows = Array(GAME_CONFIG.MAX_ATTEMPTS).fill(null)

  const getLetterColor = (letterFeedback: "correct" | "present" | "absent") => {
    switch (letterFeedback) {
      case "correct":
        return "bg-green-500 text-white"
      case "present":
        return "bg-yellow-500 text-white"
      case "absent":
        return "bg-gray-400 text-white"
    }
  }

  return (
    <div className="flex justify-center">
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GAME_CONFIG.WORD_LENGTH}, 1fr)` }}>
        {rows.map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-1">
            {Array(GAME_CONFIG.WORD_LENGTH)
              .fill(null)
              .map((_, colIndex) => {
                let letter = ""
                let letterFeedback: "correct" | "present" | "absent" | null = null

                if (rowIndex < guesses.length) {
                  letter = guesses[rowIndex][colIndex]
                  letterFeedback = feedback[rowIndex][colIndex]
                } else if (rowIndex === guesses.length) {
                  letter = currentGuess[colIndex] || ""
                }

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-12 h-12 flex items-center justify-center font-bold text-lg rounded border-2 ${
                      letterFeedback ? getLetterColor(letterFeedback) : "border-gray-300 bg-white"
                    }`}
                  >
                    {letter}
                  </div>
                )
              })}
          </div>
        ))}
      </div>
    </div>
  )
}

"use client"

interface GameGridProps {
  guesses: string[]
  currentGuess: string
  targetWord?: string
}

export function GameGrid({ guesses, currentGuess, targetWord = "" }: GameGridProps) {
  const rows = 6
  const cols = 5

  // Improved Wordle-style feedback with duplicate letter handling
  const getLetterStatuses = (guess: string): string[] => {
    if (!targetWord) return Array(guess.length).fill("empty")

    const result = Array(guess.length).fill("absent")
    const target = targetWord.toUpperCase().split("")
    const letters = guess.toUpperCase().split("")

    // Step 1: Mark correct (green) letters and track used letters
    const used = Array(target.length).fill(false)
    for (let i = 0; i < letters.length; i++) {
      if (letters[i] === target[i]) {
        result[i] = "correct"
        used[i] = true
      }
    }

    // Step 2: Mark present (yellow) letters that exist elsewhere
    for (let i = 0; i < letters.length; i++) {
      if (result[i] !== "correct") {
        const index = target.findIndex((t, j) => t === letters[i] && !used[j])
        if (index !== -1) {
          result[i] = "present"
          used[index] = true
        }
      }
    }

    return result
  }

  return (
    <div
      className="grid gap-2 justify-center"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="contents">
          {Array.from({ length: cols }).map((_, colIndex) => {
            let letter = ""
            let status = "empty"

            if (rowIndex < guesses.length) {
              letter = guesses[rowIndex][colIndex] || ""
              status = getLetterStatuses(guesses[rowIndex])[colIndex]
            } else if (rowIndex === guesses.length) {
              letter = currentGuess[colIndex] || ""
              status = letter ? "current" : "empty"
            }

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  w-12 h-12 md:w-14 md:h-14 rounded-lg font-bold text-lg md:text-xl
                  flex items-center justify-center border-2 transition-all
                  ${status === "correct" ? "bg-green-500/20 border-green-500 text-green-700" : ""}
                  ${status === "present" ? "bg-yellow-500/20 border-yellow-500 text-yellow-700" : ""}
                  ${status === "absent" ? "bg-muted border-border text-muted-foreground" : ""}
                  ${status === "current" ? "border-primary text-foreground" : ""}
                  ${status === "empty" ? "border-border text-foreground" : ""}
                `}
              >
                {letter}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
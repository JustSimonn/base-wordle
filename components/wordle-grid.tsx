import type { GuessLetter } from "@/hooks/use-wordle"

interface WordleGridProps {
  guesses: Array<{ letters: GuessLetter[] }>
  currentGuess: string
}

export function WordleGrid({ guesses, currentGuess }: WordleGridProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "correct":
        return "bg-green-500 text-white border-green-500"
      case "present":
        return "bg-yellow-500 text-white border-yellow-500"
      case "absent":
        return "bg-muted text-muted-foreground border-muted"
      default:
        return "bg-card border-border text-foreground"
    }
  }

  const renderRow = (rowIndex: number) => {
    const guess = guesses[rowIndex]
    const isCurrentRow = rowIndex === guesses.length

    if (guess) {
      return guess.letters.map((letterObj, colIndex) => (
        <div
          key={`${rowIndex}-${colIndex}`}
          className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-lg md:text-xl font-bold border-2 rounded transition-all ${getStatusColor(letterObj.status)}`}
        >
          {letterObj.letter}
        </div>
      ))
    }

    if (isCurrentRow) {
      return Array.from({ length: 5 }).map((_, colIndex) => (
        <div
          key={`current-${colIndex}`}
          className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-lg md:text-xl font-bold border-2 rounded transition-all ${
            colIndex < currentGuess.length
              ? "bg-input border-primary text-foreground"
              : "bg-card border-border text-foreground"
          }`}
        >
          {currentGuess[colIndex] || ""}
        </div>
      ))
    }

    return Array.from({ length: 5 }).map((_, colIndex) => (
      <div
        key={`empty-${rowIndex}-${colIndex}`}
        className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-lg md:text-xl font-bold border-2 rounded bg-card border-border text-foreground"
      />
    ))
  }

  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 6 }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-2 justify-center">
          {renderRow(rowIndex)}
        </div>
      ))}
    </div>
  )
}

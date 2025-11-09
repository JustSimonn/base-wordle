"use client"

interface GameKeyboardProps {
  onKeyPress: (key: string) => void
  disabled?: boolean
}

export function GameKeyboard({ onKeyPress, disabled = false }: GameKeyboardProps) {
  const rows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
  ]

  return (
    <div className="space-y-2">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 justify-center">
          {/* <CHANGE> Add Enter button on left for last row */}
          {rowIndex === 2 && (
            <button
              onClick={() => onKeyPress("Enter")}
              disabled={disabled}
              className="px-3 py-2 bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground rounded font-semibold text-sm transition-colors"
            >
              Enter
            </button>
          )}
          {row.map((letter) => (
            <button
              key={letter}
              onClick={() => onKeyPress(letter)}
              disabled={disabled}
              className="px-2 py-2 md:px-3 md:py-2 bg-card border border-border hover:border-primary disabled:opacity-50 text-foreground rounded font-semibold text-sm transition-colors"
            >
              {letter}
            </button>
          ))}
          {/* <CHANGE> Add Backspace button on right for last row */}
          {rowIndex === 2 && (
            <button
              onClick={() => onKeyPress("Backspace")}
              disabled={disabled}
              className="px-3 py-2 bg-card border border-border hover:border-primary disabled:opacity-50 text-foreground rounded font-semibold text-sm transition-colors"
            >
              ← Back
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

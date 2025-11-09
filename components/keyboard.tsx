"use client"

import { Button } from "@/components/ui/button"

interface KeyboardProps {
  onLetterClick: (letter: string) => void
  onBackspace: () => void
  onEnter: () => void
  getLetterStatus: (letter: string) => "correct" | "present" | "absent" | "empty"
  disabled?: boolean
}

export function Keyboard({ onLetterClick, onBackspace, onEnter, getLetterStatus, disabled = false }: KeyboardProps) {
  const rows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
  ]

  const getKeyColor = (letter: string) => {
    const status = getLetterStatus(letter)
    switch (status) {
      case "correct":
        return "bg-green-500 hover:bg-green-600 text-white"
      case "present":
        return "bg-yellow-500 hover:bg-yellow-600 text-white"
      case "absent":
        return "bg-muted hover:bg-muted/80 text-muted-foreground"
      default:
        return "bg-card hover:bg-card/80 border border-border text-foreground"
    }
  }

  return (
    <div className="flex flex-col gap-2 w-full max-w-2xl mx-auto">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 justify-center flex-wrap">
          {rowIndex === 2 && (
            <Button
              onClick={onEnter}
              disabled={disabled}
              variant="outline"
              size="sm"
              className="px-3 h-10 text-xs font-semibold bg-transparent"
            >
              ENTER
            </Button>
          )}
          {row.map((letter) => (
            <Button
              key={letter}
              onClick={() => onLetterClick(letter)}
              disabled={disabled}
              className={`w-8 h-10 p-0 text-sm font-semibold transition-all ${getKeyColor(letter)}`}
            >
              {letter}
            </Button>
          ))}
          {rowIndex === 2 && (
            <Button
              onClick={onBackspace}
              disabled={disabled}
              variant="outline"
              size="sm"
              className="px-3 h-10 text-xs font-semibold bg-transparent"
            >
              ← DEL
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}

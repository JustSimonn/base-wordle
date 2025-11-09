"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { useState } from "react"

interface DepositPromptProps {
  onDismiss: () => void
}

export function DepositPrompt({ onDismiss }: DepositPromptProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="p-6 border-yellow-500/50 bg-yellow-500/5 space-y-4">
      <div className="flex gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-2 flex-1">
          <h3 className="font-semibold text-foreground">Need ETH to Play</h3>
          <p className="text-sm text-muted-foreground">
            You need some Base ETH to cover gas fees when playing.
            You'll only use tiny bits of gas as you play!
          </p>

          {isExpanded && (
            <div className="text-xs text-muted-foreground space-y-2 mt-3 pt-3 border-t border-yellow-500/20">
              <p className="font-medium text-foreground">How it works:</p>
              <ul className="space-y-1 ml-2">
                <li>• Each guess consumes a small amount of gas</li>
                <li>• 25% of gas used is collected as a developer fee (capped at $0.03)</li>
                <li>• Unused balance remains in your wallet</li>
                <li>• You can withdraw your balance anytime</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 justify-between">
        <Button variant="ghost" onClick={() => setIsExpanded(!isExpanded)} size="sm" className="text-xs">
          {isExpanded ? "Hide Details" : "Learn More"}
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onDismiss} size="sm">
            Dismiss
          </Button>
          <Button className="bg-primary hover:bg-primary/90" size="sm">
            Add Funds
          </Button>
        </div>
      </div>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { formatGasAmount } from "@/lib/gas-utils"

interface GasTrackerProps {
  totalGasUsed: string
  totalDeveloperFees: string
}

export function GasTracker({ totalGasUsed, totalDeveloperFees }: GasTrackerProps) {
  const [displayGas, setDisplayGas] = useState(totalGasUsed)
  const [displayFees, setDisplayFees] = useState(totalDeveloperFees)

  useEffect(() => {
    setDisplayGas(totalGasUsed)
    setDisplayFees(totalDeveloperFees)
  }, [totalGasUsed, totalDeveloperFees])

  return (
    <Card className="p-4 bg-card/50 border-border space-y-3">
      <h3 className="font-semibold text-foreground text-sm">Gas Usage</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Total Gas Used</p>
          <p className="font-mono text-sm font-semibold text-foreground">{formatGasAmount(displayGas)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Developer Fee (25%)</p>
          <p className="font-mono text-sm font-semibold text-foreground">{formatGasAmount(displayFees)}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Each guess consumes a small amount of gas. 25% is collected as a developer fee (capped at $0.03).
      </p>
    </Card>
  )
}

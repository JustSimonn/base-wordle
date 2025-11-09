"use client"

import { Card } from "@/components/ui/card"
import { useWallet } from "@/lib/wallet-context"

export function BalanceDisplay() {
  const { balance, address } = useWallet()

  if (!address || !balance) {
    return null
  }

  const balanceNum = Number.parseFloat(balance)
  const isLow = balanceNum < 0.01 && balanceNum > 0

  return (
    <Card
      className={`p-4 space-y-2 ${
        isLow
          ? "border-yellow-500/50 bg-yellow-500/5"
          : balanceNum > 0.01
            ? "border-green-500/50 bg-green-500/5"
            : "border-red-500/50 bg-red-500/5"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground font-medium">ETH Balance</p>
        <p
          className={`text-lg font-bold font-mono ${
            isLow ? "text-yellow-600" : balanceNum > 0.01 ? "text-green-600" : "text-red-600"
          }`}
        >
          {balanceNum.toFixed(6)} ETH
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        {balanceNum > 0.01 ? "You have ETH to play" : isLow ? "Balance is running low" : "Deposit ETH to play"}
      </p>
    </Card>
  )
}

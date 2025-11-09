"use client"

import { Button } from "@/components/ui/button"

interface WalletConnectProps {
  connected: boolean
  onConnect: () => void
}

export function WalletConnect({ connected, onConnect }: WalletConnectProps) {
  return (
    <Button
      onClick={onConnect}
      variant={connected ? "default" : "outline"}
      className={connected ? "bg-primary hover:bg-primary/90 text-primary-foreground" : ""}
    >
      {connected ? "✓ Connected" : "Connect Wallet"}
    </Button>
  )
}

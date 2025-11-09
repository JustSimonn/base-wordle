"use client"

import { useWallet } from "@/lib/wallet-context"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast" // ✅ import toast hook

export function WalletButton() {
  const { isConnected, address, balance, connectWallet, disconnectWallet } = useWallet()
  const { toast } = useToast()

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  const handleConnect = async () => {
    try {
      await connectWallet()
      toast({
        title: "Wallet Connected ✅",
        description: "You are now connected to Base network.",
        duration: 4000,
      })
    } catch (err) {
      toast({
        title: "Connection Failed ❌",
        description: "Please check your wallet or try again.",
        variant: "destructive",
      })
    }
  }

  const handleDisconnect = () => {
    disconnectWallet()
    toast({
      title: "Wallet Disconnected 👋🏽",
      description: "You’ve successfully disconnected your wallet.",
      duration: 3000,
    })
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end text-sm">
          <p className="font-semibold text-foreground">{formatAddress(address)}</p>
          <p className="text-xs text-muted-foreground">{balance} ETH</p>
        </div>
        <Button
          onClick={handleDisconnect}
          variant="outline"
          size="sm"
          className="text-xs bg-transparent"
        >
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={handleConnect}
      className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm"
    >
      Connect Wallet
    </Button>
  )
}

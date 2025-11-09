// Utility functions for wallet operations
import { ethers } from "ethers"

export async function getWalletBalance(walletAddress: string, provider: ethers.Provider): Promise<string> {
  try {
    const balance = await provider.getBalance(walletAddress)
    return ethers.formatEther(balance)
  } catch (error) {
    console.error("Error fetching wallet balance:", error)
    throw error
  }
}

export function isValidWalletAddress(address: string): boolean {
  return ethers.isAddress(address)
}

export function formatWalletAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export async function estimateGasFee(provider: ethers.Provider): Promise<string> {
  try {
    const feeData = await provider.getFeeData()
    if (!feeData.gasPrice) throw new Error("Unable to fetch gas price")
    return ethers.formatEther(feeData.gasPrice)
  } catch (error) {
    console.error("Error estimating gas fee:", error)
    throw error
  }
}

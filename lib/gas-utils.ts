import { GAME_CONFIG } from "@/lib/config"
import { ethers } from "ethers"

export interface GasCalculation {
  estimatedGas: string
  gasPrice: string
  totalGasCost: string
  developerFee: string
  playerCost: string
}

export async function calculateGasForGuess(provider: ethers.BrowserProvider): Promise<GasCalculation> {
  try {
    // Estimate gas for a typical guess transaction
    // This is a placeholder - actual gas would depend on the smart contract
    const estimatedGas = "50000" // Typical gas for a transaction

    const feeData = await provider.getFeeData()
    if (!feeData.gasPrice) {
      throw new Error("Unable to fetch gas price")
    }

    const gasPrice = feeData.gasPrice
    const totalGasCost = ethers.parseUnits(estimatedGas, "wei") * gasPrice

    // Calculate developer fee (25% of gas, capped at $0.03)
    const totalGasCostEth = ethers.formatEther(totalGasCost)
    const totalGasCostNum = Number.parseFloat(totalGasCostEth)
    const developerFeeNum = Math.min(totalGasCostNum * GAME_CONFIG.GAS_FEE_PERCENTAGE, GAME_CONFIG.MAX_DEVELOPER_FEE)

    // Player pays the full gas cost
    const playerCostNum = totalGasCostNum

    return {
      estimatedGas,
      gasPrice: ethers.formatEther(gasPrice),
      totalGasCost: totalGasCostEth,
      developerFee: developerFeeNum.toFixed(8),
      playerCost: playerCostNum.toFixed(8),
    }
  } catch (error) {
    console.error("Error calculating gas:", error)
    throw error
  }
}

export function formatGasAmount(amount: string): string {
  const num = Number.parseFloat(amount)
  if (num < 0.0001) {
    return `${(num * 1000000).toFixed(2)} µETH`
  }
  return `${num.toFixed(6)} ETH`
}

export async function trackGasUsage(
  walletAddress: string,
  gasUsed: string,
  points: number,
  attempts: number,
): Promise<void> {
  try {
    const response = await fetch("/api/game/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        walletAddress,
        points,
        attempts,
        gasUsed,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to track gas usage")
    }
  } catch (error) {
    console.error("Error tracking gas usage:", error)
    throw error
  }
}

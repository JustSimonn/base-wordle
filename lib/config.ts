// Configuration for Base chain and environment variables
export const BASE_CONFIG = {
  chainId: 8453,
  chainName: "Base",
  rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org",
  explorerUrl: "https://basescan.org",
}

export const GAME_CONFIG = {
  MIN_DEPOSIT: 0.5, // $0.50 in ETH
  MAX_DEPOSIT: 1.0, // $1.00 in ETH
  GAS_FEE_PERCENTAGE: 0.25, // 25% of gas used
  MAX_DEVELOPER_FEE: 0.03, // $0.03 cap
  WORD_LENGTH: 5,
  MAX_ATTEMPTS: 6,
  POINTS_PER_WIN: 10,
}

export const DATABASE_CONFIG = {
  url: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production",
}

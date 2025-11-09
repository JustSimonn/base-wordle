import { ethers } from "ethers";

export const CONTRACT_ADDRESS = "0x5dd73a2455dda3d3e30672aa77ece3747d4904e7";

const RPC_URL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_RPC_URL) ||
  "https://base.llamarpc.com";

const readProvider = new ethers.JsonRpcProvider(RPC_URL);

console.log("📡 [contract] read RPC:", RPC_URL);
console.log("📡 [contract] contract address:", CONTRACT_ADDRESS);

export const CONTRACT_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "player", type: "address" },
      { indexed: false, internalType: "uint256", name: "score", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "totalGames", type: "uint256" }
    ],
    name: "ScoreSaved",
    type: "event"
  },
  {
    inputs: [{ internalType: "uint256", name: "score", type: "uint256" }],
    name: "saveScore",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "getLeaderboard",
    outputs: [
      { internalType: "address[]", name: "", type: "address[]" },
      { internalType: "uint256[]", name: "", type: "uint256[]" },
      { internalType: "uint256[]", name: "", type: "uint256[]" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "playerAddr", type: "address" }],
    name: "getPlayerStats",
    outputs: [
      { internalType: "uint256", name: "totalGames", type: "uint256" },
      { internalType: "uint256", name: "totalScore", type: "uint256" },
      { internalType: "uint256", name: "lastScore", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "devFeeWei",
    outputs: [ { internalType: "uint256", name: "", type: "uint256" } ],
    stateMutability: "view",
    type: "function"
  },
];

export function getReadOnlyContract() {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, readProvider);
}

export async function connectWallet(): Promise<{ address: string; signer: ethers.Signer }> {
  if (typeof window === "undefined" || !("ethereum" in window)) {
    throw new Error("No injected wallet found (MetaMask / Coinbase Wallet).");
  }

  try {
    const accounts: string[] = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
    if (!accounts || accounts.length === 0) throw new Error("No account returned from wallet.");

    const provider = new ethers.BrowserProvider(window.ethereum as any);
    const signer = await provider.getSigner();

    console.log("🟢 [wallet] connected:", accounts[0]);
    return { address: accounts[0], signer };
  } catch (err) {
    console.error("❌ [wallet] connect error:", err);
    throw err;
  }
}

export function getContractWithSigner(signer: ethers.Signer) {
  if (!signer) throw new Error("Signer required for contract writes");
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

export async function saveScore(score: number) {
  if (typeof window === "undefined") throw new Error("saveScore must be called from the browser");

  try {
    const { address, signer } = await connectWallet();
    console.log("📩 [saveScore] signing tx from", address);

    const contract = getContractWithSigner(signer);
    if (!contract.interface.getFunction("saveScore")) {
      console.error("🚨 ABI mismatch: saveScore not in ABI");
      throw new Error("ABI mismatch: saveScore not found");
    }

    const fee = await contract.devFeeWei();
    const tx = await contract.saveScore(score, { value: fee });
    console.log("⏳ [saveScore] tx submitted:", tx.hash);
    await tx.wait();
    console.log("✅ [saveScore] tx mined:", tx.hash);
    return tx.hash;
  } catch (err) {
    console.error("❌ [saveScore] error:", err);
    throw err;
  }
}

export async function getLeaderboard() {
  try {
    const contract = getReadOnlyContract();

    if (!contract.interface.getFunction("getLeaderboard")) {
      console.error("🚨 ABI mismatch — getLeaderboard not found");
      throw new Error("ABI mismatch");
    }

    const raw = await contract.getLeaderboard();
    if (!raw || !raw[0]) {
      console.warn("⚠️ [getLeaderboard] empty or bad raw response:", raw);
      throw new Error("Bad data from contract (empty)");
    }

    const [addresses, scores, games] = raw;
    const mapped = addresses.map((addr: string, i: number) => ({
      address: addr,
      totalScore: Number(scores[i]?.toString?.() ?? scores[i]),
      totalGames: Number(games[i]?.toString?.() ?? games[i])
    }));

    console.log("📊 [getLeaderboard] count:", mapped.length);
    return mapped;
  } catch (err) {
    console.error("❌ [getLeaderboard] error:", err);
    throw err;
  }
}

export async function getPlayerStats(playerAddr: string) {
  try {
    const contract = getReadOnlyContract();
    if (!contract.interface.getFunction("getPlayerStats")) {
      console.error("🚨 ABI mismatch — getPlayerStats not found");
      throw new Error("ABI mismatch");
    }
    const res = await contract.getPlayerStats(playerAddr);
    return {
      totalGames: Number(res[0]?.toString?.() ?? res[0]),
      totalScore: Number(res[1]?.toString?.() ?? res[1]),
      lastScore: Number(res[2]?.toString?.() ?? res[2])
    };
  } catch (err) {
    console.error("❌ [getPlayerStats] error:", err);
    throw err;
  }
}

/**
 * Fetch all ScoreSaved events for a player to compute wins & streak safely in block chunks
 */
export async function getPlayerEvents(playerAddr: string) {
  try {
    const contract = getReadOnlyContract();
    const filter = contract.filters.ScoreSaved(playerAddr);

    const latestBlock = await readProvider.getBlockNumber();
    const maxBlockRange = 10000; // Reduced from 100000 for better RPC compatibility
    let fromBlock = Math.max(0, latestBlock - 100000); // Start from last 100k blocks instead of genesis
    let allEvents: any[] = [];

    while (fromBlock <= latestBlock) {
      const toBlock = Math.min(fromBlock + maxBlockRange, latestBlock);
      try {
        const events = await contract.queryFilter(filter, fromBlock, toBlock);
        allEvents = allEvents.concat(events);
      } catch (chunkErr) {
        console.warn(`⚠️ [getPlayerEvents] failed chunk ${fromBlock}-${toBlock}:`, chunkErr);
        // Skip this chunk and continue
      }
      fromBlock = toBlock + 1;
    }

    allEvents.sort((a, b) => a.blockNumber - b.blockNumber);

    return allEvents.map((e) => ({
      score: Number(e.args?.score?.toString() ?? 0),
      totalGames: Number(e.args?.totalGames?.toString() ?? 0),
      timestamp: e.blockNumber
    }));
  } catch (err) {
    console.error("❌ [getPlayerEvents] error:", err);
    // Return empty array so stats still work without events
    return [];
  }
}
import { ethers } from "ethers";

// Your contract info
const CONTRACT_ADDRESS = "0x5dd73a2455dda3d3e30672aa77ece3747d4904e7";
const CONTRACT_ABI = [
  // Add the exact functions you need from your contract
  "function getLeaderboard() view returns (address[] memory, uint256[] memory, uint256[] memory)"
];

// Function to get a read-only contract
export function getReadOnlyContract() {
  // Use the default provider (no wallet required)
  const provider = new ethers.BrowserProvider((window as any).ethereum || undefined);

  // Connect contract to provider (read-only)
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  return contract;
}
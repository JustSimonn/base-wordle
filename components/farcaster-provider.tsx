"use client";

import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

/**
 * FarcasterProvider - Initializes the Farcaster Mini App SDK
 * Calls sdk.actions.ready() to dismiss the splash screen
 */
export function FarcasterProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Farcaster Mini App SDK
    const initializeFarcasterSDK = async () => {
      try {
        // Always try to call ready() - the SDK will handle if not in Farcaster environment
        await sdk.actions.ready();
        console.log("✅ Farcaster Mini App SDK ready() called");
      } catch (error) {
        // Gracefully handle errors - app should still work outside Farcaster
        console.warn("⚠️ Farcaster SDK ready() call failed (expected outside Farcaster):", error);
      }
    };

    initializeFarcasterSDK();
  }, []);

  return <>{children}</>;
}

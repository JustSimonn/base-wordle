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
        // Check if we're actually running in a Farcaster Mini App environment
        const isInFarcaster = typeof window !== "undefined" && 
                              ((window as any).sdk || (window as any).farcaster);
        
        if (isInFarcaster && (window as any).sdk?.actions?.ready) {
          // Call ready() to dismiss the splash screen and show the app
          await sdk.actions.ready();
          console.log("✅ Farcaster Mini App SDK initialized successfully");
        } else {
          console.log("🌐 Running outside Farcaster - skipping SDK initialization");
        }
      } catch (error) {
        // Gracefully handle errors - app should still work outside Farcaster
        console.warn("⚠️ Farcaster SDK initialization failed:", error);
      }
    };

    initializeFarcasterSDK();
  }, []);

  return <>{children}</>;
}

"use client";

import { useRef, useEffect, useState } from "react";
import type { KrispNoiseFilterProcessor } from "@livekit/krisp-noise-filter";

/**
 * Dynamically loads and owns a Krisp noise filter processor.
 * The import is deferred to useEffect so the package (which uses Worker/AudioWorklet)
 * is never evaluated during SSR. `ready` becomes true once the processor is created —
 * callers should include it in any useEffect dependency array that reads filterRef.current.
 */
export function useKrispNoiseFilter() {
  const filterRef = useRef<KrispNoiseFilterProcessor | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let destroyed = false;
    (async () => {
      const { KrispNoiseFilter, isKrispNoiseFilterSupported } = await import(
        "@livekit/krisp-noise-filter"
      );
      if (destroyed) return;
      if (!isKrispNoiseFilterSupported()) {
        console.log("[krisp] Not supported on this browser — skipping.");
        return;
      }
      filterRef.current = KrispNoiseFilter({ quality: "medium" });
      console.log("[krisp] Processor instance created.");
      setReady(true);
    })().catch(console.error);

    return () => {
      destroyed = true;
      filterRef.current?.destroy().catch(() => {});
      filterRef.current = null;
    };
  }, []);

  return { filterRef, ready };
}

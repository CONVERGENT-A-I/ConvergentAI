"use client";

import { useEffect } from "react";

export default function BackendConnectionTest() {
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://be.convergentai.tech" || "http://localhost:3001";
        const response = await fetch(`${backendUrl}/api/test`);
        const data = await response.json();
        if (data.status === "success") {
          console.log("✅ [ConvergentAI] Backend Connection: SUCCESS");
          console.log("📡 Payload:", data);
        } else {
          console.warn("⚠️ [ConvergentAI] Backend Connection: Unexpected Response", data);
        }
      } catch (error) {
        console.error("❌ [ConvergentAI] Backend Connection: FAILED");
        console.log("Make sure your Next.js server is running properly.");
      }
    };

    checkConnection();
  }, []);

  return null; // This component doesn't render anything
}

"use client";

import { useEffect } from "react";

export default function BackendConnectionTest() {
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/test");
        const data = await response.json();
        if (data.status === "success") {
          console.log("✅ [ConvergentAI] Backend Connection: SUCCESS");
          console.log("📡 Payload:", data);
        } else {
          console.warn("⚠️ [ConvergentAI] Backend Connection: Unexpected Response", data);
        }
      } catch (error) {
        console.error("❌ [ConvergentAI] Backend Connection: FAILED");
        console.log("Make sure your backend is running on http://localhost:3001");
      }
    };

    checkConnection();
  }, []);

  return null; // This component doesn't render anything
}

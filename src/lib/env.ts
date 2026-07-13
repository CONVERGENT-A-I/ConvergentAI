export const env = {
  LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY,
  LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET,
  LIVEKIT_URL: process.env.LIVEKIT_URL,
};

export function validateServerEnv() {
  const missing = [];
  if (!env.LIVEKIT_API_KEY) missing.push("LIVEKIT_API_KEY");
  if (!env.LIVEKIT_API_SECRET) missing.push("LIVEKIT_API_SECRET");
  if (!env.LIVEKIT_URL) missing.push("LIVEKIT_URL");
  
  if (missing.length > 0) {
    console.error(`[ENV VALIDATION] ❌ Missing required environment variables: ${missing.join(", ")}`);
    return { isValid: false, missing };
  }
  
  return { isValid: true, missing: [] };
}

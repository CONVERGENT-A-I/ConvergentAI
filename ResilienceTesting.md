# 🛡️ Resilience Layer Testing Guide (Localhost)

To ensure the Ailana Floating CTA handles edge cases gracefully, follow these steps to test the 4 resilience layers on your local machine (`http://localhost:3000`).

### 1. Inactivity & AFK Watchdog ✅ COMPLETED
- **Goal:** Verify the system safely terminates idle sessions to save backend resources.
- **Steps:** 
  1. Open the Floating CTA and connect to Ailana.
  2. Take your hands off the mouse and keyboard (do not move the cursor, click, or type) for **60 seconds**.
  3. **Expected Result:** A popup will appear warning that the call will close automatically, displaying a 10-second countdown. 
  4. Click "Continue Session" to abort the countdown, or wait 10 seconds to watch the call gracefully end.

### 2. Network Loss & Auto-Recovery
- **Goal:** Verify the UI handles dropped internet connections seamlessly.
- **Steps:**
  1. Start a live session with Ailana.
  2. Open Chrome Developer Tools (F12) -> Go to the **Network** tab -> Change the throttling dropdown from "No throttling" to **"Offline"** (or just disconnect your computer's WiFi).
  3. **Expected Result:** The UI immediately overlays a red banner reading *"Internet connection lost"*.
  4. Change the throttling back to **"No throttling"**.
  5. **Expected Result:** A banner reading *"Connection restored. Restarting session…"* appears, and the LiveKit room automatically re-connects.

### 3. Avatar Server Capacity / Failure Fallback
- **Goal:** Verify the system falls back to voice-only mode if the 3D avatar (LemonSlice) fails to boot.
- **Steps:**
  1. *Note: Since this relies on a real backend failure, the easiest way to test this locally is a quick code mock.*
  2. In `src/components/floating-cta/index.tsx`, locate the `fetchToken` success block (around line 280), and temporarily add: `handleAvatarStatus("capacity");` right after `setToken(data.token);`.
  3. Connect to a session.
  4. **Expected Result:** The UI will display a banner *"Avatar at capacity — using voice mode"*, hide the 3D avatar video feed, and keep the voice channel active. (Remove the mock code when done).

### 4. Connection Timeout Guard
- **Goal:** Verify that a hanging backend doesn't freeze the frontend infinitely.
- **Steps:**
  1. Open your terminal and **stop your backend server** (Ctrl+C on the `backend` terminal).
  2. Refresh the frontend at `http://localhost:3000` and click the CTA to start a session.
  3. **Expected Result:** The UI will say "Connecting...", wait exactly 15 seconds, and then gracefully abort with the error message: *"Connection timed out. Please try again."* instead of spinning infinitely.

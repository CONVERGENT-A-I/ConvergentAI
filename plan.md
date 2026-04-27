# Simplification of Ailana CTA & UI Flow

This document details the implementation plan to modernize the Ailana AI Assistant user experience based on the latest client feedback. The goal is to strip away the omnichannel clutter, adopt a minimalist "Google Meet" style interface, and lean heavily on the AI to dynamically route users. 

## Proposed Changes

### Milestone 1: Streamlined Initialization & Connectivity
Remove the intermediate omnichannel selection slide-out.
1. When the CTA is clicked, show the **Compliance popup** immediately.
2. Upon agreement, play the pre-recorded "warm up" video.
3. Establish the LiveKit connection in the background during the video.
4. Transition seamlessly into the live Ailana engagement without any additional user clicks.

#### [MODIFY] src/components/floating-cta.tsx
- Remove the 6-button channel selection screen.
- Adjust `flowPhase` logic to route `idle` -> `compliance` -> `intro` (while connecting) -> `live`.

### Milestone 2: Unified "Google Meet" Style UI
Overhaul the live room UI to be clean and focused on the Avatar.
1. **Bottom Control Bar**: Add buttons for Microphone, Speaker, Video (on/off), and Chat.
2. **Top Switcher**: Add a "Prefer to talk instead?" toggle to switch between Video, Voice, and Chat modes.
3. **Trust Markers**: Add subtle labels: "Available 24/7", "Secure & Private", "AI-powered, Human-focused".

#### [MODIFY] src/components/floating-cta.tsx
- Add bottom control bar overlay.
- Add top mode switcher.
- Add UI text overlays for trust markers.

### Milestone 3: Integrated Chat Panel & "Empty State" Experience
Create a seamless chat experience without leaving the avatar screen.
1. **Side Panel**: Clicking "Chat" opens a panel on the right side of the avatar.
2. **Empty State**: Display actionable chips (`[Connect to Slack]`, `[Schedule a Call]`, `[Email Summary]`) at the bottom of the chat to guide users.
3. **Ghost Text**: Input placeholder will read "Ask me to 'Connect to [Channel]'...".

#### [MODIFY] src/components/live-chat-panel.tsx (or floating-cta.tsx)
- Integrate the chat panel as a side-drawer within the main window instead of replacing the entire view.
- Add empty state chips and ghost text.

### Milestone 4: Enhanced Audio/Visual Cues & Subtitles
Improve visual feedback for voice interactions.
1. **Subtitles Box**: Add a small, elegant text box at the bottom (above the control bar) showing real-time transcripts.
2. **Waveform/Pulse Indicator**: Change the microphone icon to a glowing pulse or waveform when listening.
3. **Contextual Help**: Add a one-time tooltip ("Try saying, 'Connect me to WhatsApp'") and a "?" icon for an overlay of available commands.
4. **Suggested Commands text**: Display a cycling text line near the control bar ("Try: 'Call me'").

#### [MODIFY] src/components/floating-cta.tsx
- Integrate transcript listener (via LiveKit room events or chat track) to display subtitles.
- Add Framer Motion pulsing animations to the active mic icon.
- Implement the tooltip and "?" overlay state.

### Milestone 5: Dynamic Ailana Greeting & Omnichannel Routing
Ensure the AI leads the interaction.
1. **Pre-recorded Greeting Update**: The video/audio script needs to say: "Hi, I'm Ailana! I can help you here, or if you prefer, just ask me to move this conversation to Email or Phone."
2. **Backend Tools**: Ensure Ailana's system prompt understands that it should use tools to transition the user to other channels (Slack, Email, Phone) rather than relying on UI buttons.

#### [MODIFY] backend/src/agent.ts
- Update the system prompt to reflect the new onboarding script and tool availability.


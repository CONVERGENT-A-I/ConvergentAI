# Simplification of Ailana CTA & UI Flow

This document details the implementation plan to modernize the Ailana AI Assistant user experience based on the latest client feedback. The goal is to strip away the omnichannel clutter, adopt a minimalist "Google Meet" style interface, and lean heavily on the AI to dynamically route users. 

## Proposed Changes

### Milestone 1: Streamlined Initialization & Connectivity ✅ DONE
Remove the intermediate omnichannel selection slide-out.
1. When the CTA is clicked, play the pre-recorded "warm up" intro video.
2. Upon intro completion, show the **Compliance popup**.
3. Establish the LiveKit connection in the background during the video.
4. Upon agreement, transition seamlessly into the live Ailana engagement without any additional user clicks.

#### [MODIFY] src/components/floating-cta.tsx ✅
- `flowPhase` logic routes `idle` -> `intro` (while connecting) -> compliance overlay -> `live`.
- 6-button channel selection grid is dead code (will be cleaned up in M2).

### Milestone 2: Unified "Google Meet" Style UI ✅ DONE
Overhaul the live room UI to match the reference design (see UI reference image).
1. **Top Header Bar**: Logo left, mode switcher center (Video/Voice/Chat pills), trust markers right.
2. **Split Layout**: Avatar video (left ~65%) + Chat panel (right ~35%).
3. **Avatar Controls**: Bottom-center overlay with Mute, Stop Video, End (red), Share, More.
4. **Subtitle Overlay**: Speech bubble on avatar showing AI transcript.
5. **Bottom Section**: "Prefer to talk instead?" with "Talk to me" CTA.
6. **Trust Footer**: "Your information is secure and never shared." | "AI-Powered. Human-Focused. 24/7."

#### [MODIFY] src/components/floating-cta.tsx
- Remove the 6-button channel selection grid (dead code cleanup).
- Remove `SideButton` component and sidebar navigation.
- Remove `flowPhase === 'chat'` as a separate phase (chat is now a side panel).
- Add top mode switcher pills (Video/Voice/Chat) in header during live phase.
- Add trust markers in header.
- Add split layout: avatar area + chat panel.
- Add "Prefer to talk instead?" section.
- Add trust footer.

#### [MODIFY] src/components/video-stage.tsx
- Add `hideControls` prop to suppress built-in footer/controls.
- Parent (floating-cta) renders custom controls overlay instead.

#### [CREATE] Custom RoomControls + InRoomChatPanel components (inline in floating-cta.tsx)
- RoomControls: Custom Mic/Camera/End/Share/More buttons using LiveKit room context.
- InRoomChatPanel: Chat panel using LiveKit `useChat()` hook, with timestamps and styling.

### Milestone 3: Integrated Chat Panel & "Empty State" Experience ✅ DONE
Create a seamless chat experience without leaving the avatar screen.
1. **Side Panel**: Chat panel always visible alongside avatar in the split layout.
2. **Empty State**: Display actionable chips (`[Connect to Slack]`, `[Schedule a Call]`, `[Email Summary]`) at the bottom of the chat to guide users.
3. **Ghost Text**: Input placeholder will read "Type a message...".

#### [MODIFY] src/components/floating-cta.tsx
- Integrated as part of M2's split layout (chat panel is always visible alongside avatar).

### Milestone 4: Enhanced Audio/Visual Cues & Subtitles ✅ DONE
Improve visual feedback for voice interactions.
1. **Subtitles Box**: Add a small, elegant text box at the bottom (above the control bar) showing real-time transcripts.
2. **Waveform/Pulse Indicator**: Change the microphone icon to a glowing pulse or waveform when listening.
3. **Contextual Help**: Add a one-time tooltip ("Try saying, 'Connect me to WhatsApp'") and a "?" icon for an overlay of available commands.
4. **Suggested Commands text**: Display a cycling text line near the control bar ("Try: 'Call me'").

#### [MODIFY] src/components/floating-cta.tsx
- Integrate transcript listener (via LiveKit room events or chat track) to display subtitles.
- Add Framer Motion pulsing animations to the active mic icon.
- Implement the tooltip and "?" overlay state.

### Milestone 5: Dynamic Ailana Greeting & Omnichannel Routing ✅ DONE
Ensure the AI leads the interaction.
1. **Pre-recorded Greeting Update**: The video/audio script needs to say: "Hi, I'm Ailana! I can help you here, or if you prefer, just ask me to move this conversation to Email or Phone."
2. **Backend Tools**: Ensure Ailana's system prompt understands that it should use tools to transition the user to other channels (Slack, Email, Phone) rather than relying on UI buttons.

#### [MODIFY] backend/src/agent.ts
- Update the system prompt to reflect the new onboarding script and tool availability.

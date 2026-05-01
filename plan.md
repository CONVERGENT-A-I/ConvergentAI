# ConvergentAI: UX Optimization & Voice Engagement Roadmap

This roadmap focuses on refining the AI interaction experience, ensuring channel consistency, and improving user onboarding for voice-driven conversations.

## Milestone 1: Channel Alignment & Suggestion Accuracy ✅ DONE
**Goal**: Ensure all AI-suggested actions and UI prompts reflect the supported communication channels (Video, Voice, Chat).
*   **Update Suggested Commands**: Audit and replace legacy suggestions ("Slack", "Email", "Schedule meeting") in `SuggestedCommands` with supported channel transitions:
    *   *"Try: 'Switch to Video'"*
    *   *"Try: 'Let's Chat'"*
    *   *"Try: 'Call me'"*
*   **Update Contextual Help**: Revise the "Voice Commands" help overlay to match actual system capabilities.
*   **Refine Chat Onboarding Chips**: Update the quick-action chips in the `InRoomChatPanel` to remove unsupported integrations like Slack.

## Milestone 2: Audio Orchestration & Regulatory Clarity ✅ DONE
**Goal**: Eliminate audio collisions between the system's regulatory announcement and the AI's opening greeting.
*   **Announcement Callback**: Modify the `SpeechSynthesis` logic to use the `onend` event handler.
*   **Delayed Agent Trigger**: Prevent the `SYSTEM_CHANNEL_START` message from being sent until the "This session is being recorded..." notification has fully completed.
*   **Visual Sync**: Ensure the "Recording" (REC) badge and status indicators appear in perfect sync with the audio announcement.

## Milestone 3: Voice Onboarding & Mic Awareness
**Goal**: Proactively guide users to enable their microphone, especially when entering voice-specific modes.
*   **Mic-Check Overlay**: Implement a subtle but clear "Microphone Muted" visual alert or pulsing highlight on the unmute button if the user enters `voice` mode with a disabled mic.
*   **Voice-Mode Auto-Prompt**: Add a one-time "Click to Speak" tooltip or overlay when a user switches to Voice/Video mode to ensure they are aware of the manual unmute requirement.
*   **Status Indicator Enhancement**: Make the mic status more prominent in the control bar when the AI is waiting for user input.

---
**Success Metric**: Users successfully engage in 2-way voice conversations without guidance, and all AI-driven suggestions lead to functional system features.

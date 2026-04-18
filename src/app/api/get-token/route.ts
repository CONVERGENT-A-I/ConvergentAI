import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export async function POST(req: NextRequest) {
  try {
    const { roomName, participantName, metadata, mode } = await req.json();

    if (!roomName || !participantName) {
      return NextResponse.json({ error: "roomName and participantName are required" }, { status: 400 });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json({ error: "LiveKit server side configuration missing" }, { status: 500 });
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      metadata: metadata,
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    // ── Keyframe Labs session ──────────────────────────────────────────────
    // Only created for avatar-chat mode — avoids burning concurrent session
    // slots for video/voice users on limited Keyframe dev plans.
    let keyframe: { server_url: string; participant_token: string; agent_identity: string } | null = null;
    if (mode === "avatar-chat" || mode === "video") {
      const kfApiKey = process.env.KEYFRAME_API_KEY;
      const kfSlug = process.env.KEYFRAME_PERSONA_SLUG;

      if (kfApiKey && kfSlug) {
        try {
          console.log(`[get-token]: Requesting Keyframe session for persona: ${kfSlug}`);
          const kfRes = await fetch("https://api.keyframelabs.com/v1/sessions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${kfApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ persona_slug: kfSlug }),
          });

          if (kfRes.ok) {
            const raw = await kfRes.json();
            console.log("[get-token]: Keyframe raw response:", JSON.stringify(raw, null, 2));

            // Normalize: API may return flat OR nested under session_details
            if (raw.session_details) {
              keyframe = {
                server_url:        raw.session_details.server_url,
                participant_token: raw.session_details.participant_token,
                agent_identity:    raw.session_details.agent_identity,
              };
            } else {
              keyframe = {
                server_url:        raw.server_url,
                participant_token: raw.participant_token,
                agent_identity:    raw.agent_identity,
              };
            }
            console.log("[get-token]: Keyframe session normalized →", keyframe);
          } else {
            const body = await kfRes.text();
            console.error(`[get-token]: Keyframe API ${kfRes.status}:`, body);
          }
        } catch (err) {
          console.error("[get-token]: Failed to fetch Keyframe session:", err);
        }
      } else {
        console.warn("[get-token]: KEYFRAME_API_KEY or KEYFRAME_PERSONA_SLUG missing — avatar disabled");
      }
    }
    // ─────────────────────────────────────────────────────────────────────

    return NextResponse.json({ token, serverUrl: wsUrl, keyframe });
  } catch (error) {
    console.error("Error generating token:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

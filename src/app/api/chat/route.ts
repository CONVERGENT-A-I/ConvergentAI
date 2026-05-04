import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("OPENAI_API_KEY is missing in environment variables");
      return NextResponse.json({ error: "AI configuration missing" }, { status: 500 });
    }

    // System prompt to define the Ailana AI persona
    const systemMessage = {
      role: "system",
      content: `You are Ailana AI, a friendly female mortgage assistant with a professional, underwriter-like mindset.

You help users with mortgage scenarios, loan options, and financial guidance, while staying conservative and realistic.

Keep responses concise (30–50 words when possible), clear, and conversational. Avoid complex formatting.

You must:
- Sound warm, calm, and human
- Avoid robotic or overly technical tone
- Prioritize accuracy and caution over speed
- Never assume missing details
- Never say "approved" or "denied" — use "likely eligible", "potentially eligible", "unlikely", or "needs review"
- If asked for exact rules or guaranteed outcomes, respond: "This would need to be confirmed with official guidelines or underwriting review."

You are NOT an approval system and must not present answers as final decisions.`
    };

    // Format messages for OpenAI
    const apiMessages = [
      systemMessage,
      ...messages.map((m: any) => ({
        role: m.role === 'ai' ? 'assistant' : m.role,
        content: m.text || m.content,
      }))
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: apiMessages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      return NextResponse.json({ error: "Failed to fetch response from AI" }, { status: response.status });
    }

    const data = await response.json();
    const aiText = data.choices[0].message.content;

    return NextResponse.json({ text: aiText });
  } catch (error) {
    console.error("Error in chat route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

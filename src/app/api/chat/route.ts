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
      content: "You are Ailana AI, a friendly female mortgage assistant. You help users with their mortgage queries, loan options, and financial planning. Keep your responses precise, typically between 30 and 40 words. If you can answer in fewer words, do so. Avoid complex markdown."
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

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // ── 1. Grab the API key from the environment ──────────────────────
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GEMINI_API_KEY environment variable." },
      { status: 500 }
    );
  }

  // ── 2. Parse the request body ─────────────────────────────────────
  let content: string;
  let vibe: string;

  try {
    const body = await req.json();
    content = body.content;
    vibe = body.vibe;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  if (!content || !vibe) {
    return NextResponse.json(
      { error: "Both 'content' and 'vibe' are required." },
      { status: 400 }
    );
  }

  // ── 3. Build the prompt ───────────────────────────────────────────
  const prompt = `You are a world-class LinkedIn ghostwriter known for high engagement.

USER INPUT (Source Material):
"""
${content}
"""

YOUR TASK:
Write exactly 3 DISTINCT LinkedIn posts based on the source material above. Use a **${vibe}** tone.

CRITICAL STRUCTURAL RULES:
1.  **Structure 1 (The Story):** Start with a personal "I" statement or a moment in time. Focus on the journey/struggle.
2.  **Structure 2 (The Value List):** A punchy headline followed by a bulleted list of actionable takeaways.
3.  **Structure 3 (The Contrarian/Insight):** Start with a bold, slightly controversial statement or a "Hard Truth."

⛔️ NEGATIVE CONSTRAINTS (READ CAREFULLY):
- **NO LABELS:** Do NOT start posts with "Post 1:", "Option 1:", "The Story:", "##", or any other header. Start directly with the hook.
- **NO HASHTAGS:** Do not use hashtags.
- **NO EMOJIS:** Unless the tone is specifically "Funny".
- **NO FLUFF:** Do not use "Hello connections" or "I want to share".

OUTPUT FORMAT:
Return ONLY raw, parseable JSON. Do not include markdown formatting.
{
  "posts": [
    "Text of post 1 (starts immediately with the hook)",
    "Text of post 2 (starts immediately with the hook)",
    "Text of post 3 (starts immediately with the hook)"
  ]
}`;

  // ── 4. Call Google Gemini ──────────────────────────────────────────
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // ── 5. Parse the AI response into JSON ──────────────────────────
    // Sometimes the model wraps the JSON in markdown code fences — strip them.
    const cleaned = text
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Gemini API error:", err);
    return NextResponse.json(
      { error: "Something went wrong generating your posts. Please try again." },
      { status: 500 }
    );
  }
}

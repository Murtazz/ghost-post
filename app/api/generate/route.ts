import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// ── Prompt builders ───────────────────────────────────────────────────
function buildLinkedInPrompt(content: string, vibe: string) {
  return `You are a world-class LinkedIn ghostwriter known for high engagement.

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
  "title": "A short 4-8 word summary of the topic (e.g. 'Remote Work Productivity Tips')",
  "posts": [
    "Text of post 1 (starts immediately with the hook)",
    "Text of post 2 (starts immediately with the hook)",
    "Text of post 3 (starts immediately with the hook)"
  ]
}`;
}

function buildTwitterPrompt(content: string, vibe: string) {
  return `You are a viral tweet ghostwriter who specializes in high-engagement X/Twitter content.

USER INPUT (Source Material):
"""
${content}
"""

YOUR TASK:
Write exactly 3 DISTINCT tweets based on the source material above. Use a **${vibe}** tone.

CRITICAL STRUCTURAL RULES:
1.  **Structure 1 (The "How I did it"):** Share a result + timeframe. Example pattern: "I [achieved X] in [Y time]. Here's what actually worked:"
2.  **Structure 2 (The Contrarian):** Challenge conventional wisdom. Pattern: "Stop doing X. Start doing Y. Here's why:"
3.  **Structure 3 (The Listicle Hook):** Numbered list of quick-hit insights. Pattern: "5 ways to [achieve X] (that no one talks about):"

⛔️ NEGATIVE CONSTRAINTS (READ CAREFULLY):
- **STRICTLY under 280 characters per tweet.** This is a HARD limit. Count carefully.
- **NO LABELS:** Do NOT start tweets with "Tweet 1:", "Option 1:", "##", or any header. Start directly with the hook.
- **NO HASHTAGS:** Do not use hashtags.
- **NO @MENTIONS:** Do not mention any accounts.
- **PUNCHY & DIRECT:** Every word must earn its place. No filler.

OUTPUT FORMAT:
Return ONLY raw, parseable JSON. Do not include markdown formatting.
{
  "title": "A short 4-8 word summary of the topic (e.g. 'Why Most Startups Fail Early')",
  "posts": [
    "Text of tweet 1 (MUST be under 280 characters)",
    "Text of tweet 2 (MUST be under 280 characters)",
    "Text of tweet 3 (MUST be under 280 characters)"
  ]
}`;
}

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
  let platform: string;

  try {
    const body = await req.json();
    content = body.content;
    vibe = body.vibe;
    platform = body.platform || "linkedin";
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

  // ── 3. Build the prompt based on platform ─────────────────────────
  const prompt =
    platform === "twitter"
      ? buildTwitterPrompt(content, vibe)
      : buildLinkedInPrompt(content, vibe);

  // ── 4. Call Google Gemini ──────────────────────────────────────────
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // ── 5. Parse the AI response into JSON ──────────────────────────
    const cleaned = text
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    // ── 6. If user is logged in, save to Supabase ───────────────────
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const platformLabel =
          platform === "twitter" ? "(Twitter) " : "";
        const aiTitle = parsed.title || "";
        const topic = aiTitle
          ? platformLabel + aiTitle
          : platformLabel +
            (content.length > 200 ? content.slice(0, 200) + "…" : content);

        await supabase.from("posts").insert({
          user_id: user.id,
          topic,
          vibe,
          generated_content: parsed.posts,
        });
      }
    } catch (dbErr) {
      // DB save is non-critical — log but don't fail the request
      console.error("Failed to save to Supabase:", dbErr);
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Gemini API error:", err);
    return NextResponse.json(
      { error: "Something went wrong generating your posts. Please try again." },
      { status: 500 }
    );
  }
}

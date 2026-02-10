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
  const prompt = `You are a LinkedIn content expert and ghostwriter.

A user has given you the following raw text (it could be an article link, messy notes, or a brain-dump):

---
${content}
---

Using that as source material, write exactly 3 distinct LinkedIn posts in a **${vibe}** tone.

Rules:
- Each post should be self-contained and ready to copy-paste into LinkedIn.
- Use short paragraphs, line breaks, and hooks that grab attention.
- Keep each post under 1500 characters.
- Do NOT use hashtags or "—" in the posts.
- Do NOT number or label the posts (no "Post 1", "Post 2", etc.).

Return ONLY valid JSON in this exact format (no markdown, no code fences):
{
  "posts": [
    "Full text of post 1 here",
    "Full text of post 2 here",
    "Full text of post 3 here"
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

import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { db } from "../../../../../firebase/admin";
import { getRandomInterviewCover } from "../../../../../lib/utils";

export async function GET() {
  return Response.json({ success: true, data: "Thank You!" }, { status: 200 });
}

// To generate AI-based interview questions based on user input and store them in Firestore.
export async function POST(request: Request) {
  // ---------- 1. Parse raw body ----------
  const rawBody = await request.json();

  // ---------- 2. Detect Vapi‑tool payload ----------
  let payload: any = {};
  if (rawBody?.message?.toolCallList?.[0]?.function?.arguments) {
    // Assistant tool call → arguments are a JSON string
    const toolArgs = JSON.parse(
      rawBody.message.toolCallList[0].function.arguments as string
    );
    payload = { ...toolArgs };
  } else {
    // Direct HTTP call (Postman / test) → body already JSON
    payload = { ...rawBody };
  }

  // ---------- 3. Pull userid from safest place ----------
  const userid =
    // sent by frontend in /call metadata
    rawBody?.metadata?.userid ||
    // or custom header fallback
    request.headers.get("x-user-id") ||
    // or body (Postman test)
    payload.userid;

  const { type, role, level, techstack, amount } = payload;

  // ---------- 4. Validate ----------
  if (!type || !role || !level || !techstack || !amount || !userid) {
    console.log("❌ Missing field(s)", {
      type,
      role,
      level,
      techstack,
      amount,
      userid,
    });
    return NextResponse.json(
      { success: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    // ---------- 5. Generate questions with Gemini ----------
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare ${amount} ${type} interview questions for a ${level} ${role}
using: ${techstack}. Return JSON array only.`,
    });

    // ---------- 6. Save to Firestore ----------
    await db.collection("interviews").add({
      role,
      type,
      level,
      techstack: techstack.split(","),
      question: JSON.parse(questions),
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("🔥 Gemini / Firestore error:", error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}

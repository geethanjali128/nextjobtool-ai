import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { db } from "../../../../../firebase/admin";
import { getRandomInterviewCover } from "../../../../../lib/utils";

type Payload = {
  type?: string;
  role?: string;
  level?: string;
  techstack?: string;
  amount?: number;
  userid?: string;
};

export async function GET() {
  return Response.json({ success: true, data: "Thank You!" }, { status: 200 });
}

/// POST — Generate AI interview questions + store in Firestore
export async function POST(request: Request) {
  const rawBody = await request.json();

  // --- Step 1: Extract Payload ---
  let payload: Payload = {};
  if (rawBody?.message?.toolCallList?.[0]?.function?.arguments) {
    try {
      const toolArgs = JSON.parse(
        rawBody.message.toolCallList[0].function.arguments as string
      );
      payload = { ...toolArgs };
    } catch (error) {
      console.error("❌ Failed to parse toolCall arguments:", error);
      return NextResponse.json(
        { success: false, error: "Invalid toolCall arguments" },
        { status: 400 }
      );
    }
  } else {
    payload = { ...rawBody };
  }

  // --- Step 2: Get userId from safest place ---
  const userid: string | null =
    rawBody?.metadata?.userid ||
    request.headers.get("x-user-id") ||
    payload.userid ||
    null;

  const { type, role, level, techstack, amount } = payload;

  // --- Step 3: Validate Inputs ---
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
    // --- Step 4: Generate Questions ---
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare ${amount} ${type} interview questions for a ${level} ${role}. Use: ${techstack}. Return JSON array only.`,
    });

    // --- Step 5: Parse Questions ---
    let parsedQuestions: string[];
    try {
      parsedQuestions = JSON.parse(questions);
    } catch (e) {
      console.error("❌ Failed to parse Gemini response:", questions);
      return NextResponse.json(
        { success: false, error: "Invalid JSON from Gemini" },
        { status: 500 }
      );
    }

    // --- Step 6: Save to Firestore ---
    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(","),
      question: parsedQuestions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(
      "🔥 Gemini / Firestore error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

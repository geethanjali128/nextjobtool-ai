import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { db } from "../../../../../firebase/admin";
import { getRandomInterviewCover } from "../../../../../lib/utils";

interface Payload {
  type: string;
  role: string;
  level: string;
  techstack: string;
  amount: number;
  userid?: string;
}

export async function POST(request: Request) {
  const rawBody = await request.json();

  console.log("📦 Full Request Body:", JSON.stringify(rawBody, null, 2));

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // ✅ Extract tool arguments
  let payload: Partial<Payload> = {};
  if (rawBody?.message?.toolCallList?.[0]?.function?.arguments) {
    const args = rawBody.message.toolCallList[0].function.arguments;
    payload = typeof args === "string" ? JSON.parse(args) : args;
  } else {
    payload = { ...rawBody };
  }

  // ✅ Extract userid correctly
  function extractUserId(reqBody) {
    return (
      // Vapi sometimes puts it under call.assistantOverrides
      reqBody?.call?.assistantOverrides?.variableValues?.userid ||
      // Sometimes it comes under assistant.variableValues
      reqBody?.assistant?.variableValues?.userid ||
      // Sometimes Vapi flattens everything into top-level variableValues (rare but safe fallback)
      reqBody?.variableValues?.userid ||
      null
    );
  }

  const userid = extractUserId(rawBody);

  if (!userid) {
    console.error("❌ userid is missing");
    return Response.json(
      { success: false, error: "userid is missing" },
      { status: 400 }
    );
  }

  const { type, role, level, techstack, amount } = payload;

  if (!type || !role || !level || !amount || !userid) {
    console.log("❌ Missing fields", {
      type,
      role,
      level,
      techstack,
      amount,
      userid,
    });
    return Response.json(
      { success: false, error: "Missing fields" },
      { status: 400 }
    );
  }

  try {
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Return JSON like: ["Q1", "Q2", "Q3"].
        No explanation, no formatting.`,
    });

    const interview = {
      role,
      type,
      level,
      techstack: techstack ? techstack.split(",").map((t) => t.trim()) : [],
      questions: JSON.parse(questions),
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    console.log("📄 Interview object:", interview);

    await db.collection("interviews").add(interview);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("🔥 Error generating/storing interview:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to generate or parse interview questions",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

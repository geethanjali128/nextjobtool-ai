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

function extractUserId(body: any): string | null {
  return (
    body?.userid ||
    body?.assistantOverrides?.variableValues?.userid ||
    body?.call?.assistantOverrides?.variableValues?.userid ||
    body?.call?.variableValues?.userid ||
    body?.message?.call?.assistantOverrides?.variableValues?.userid || // catch deeply nested edge cases
    null
  );
}

export async function POST(request: Request) {
  console.log("API HIT");
  const rawBody = await request.json();

  const userid = extractUserId(rawBody);

  // console.log("📦 Full Request Body:", JSON.stringify(rawBody, null, 2));

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
    console.log("RAW BODY:", JSON.stringify(rawBody, null, 2));
  } else {
    payload = { ...rawBody };
  }

  console.log("PAYLOAD:", payload);

  console.log("USERID:", userid);

  if (!userid) {
    console.error("❌ userid is missing");
    return Response.json(
      { success: false, error: "userid is missing" },
      { status: 400 },
    );
  }

  const { type, role, level, techstack, amount } = payload;

  if (!type || !role || !level || !amount || !userid) {
    // console.log("❌ Missing fields", {
    //   type,
    //   role,
    //   level,
    //   techstack,
    //   amount,
    //   userid,
    // });
    return Response.json(
      { success: false, error: "Missing fields" },
      { status: 400 },
    );
  }

  try {
    const { text: questions } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Return JSON like: ["Q1", "Q2", "Q3"].
        No explanation, no formatting.`,
    });
    console.log("RAW QUESTIONS:", questions);

    console.log("PARSING QUESTIONS");
    const interview = {
      role,
      type,
      level,
      techstack: techstack ? techstack.split(",").map((t) => t.trim()) : [],

      questions: JSON.parse(
        questions
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim(),
      ),
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    console.log("📄 Interview object:", interview);

    console.log("SAVING TO FIRESTORE");

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
      { status: 500 },
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

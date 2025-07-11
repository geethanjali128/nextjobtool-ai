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

  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*", // allow all origins or set your domain
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // 1. Extract parameters from Vapi Tool OR manual POST (like Postman)
  let payload: Partial<Payload> = {};

  // Tool call payload (from assistant)

  if (rawBody?.message?.toolCallList?.[0]?.function?.arguments) {
    const args = rawBody.message.toolCallList[0].function.arguments;
    payload = JSON.parse(args); // convert from string to JSON
  } else {
    payload = { ...rawBody };
  }

  // 2. Extract userId from metadata or headers or payload
  const userid =
    rawBody?.metadata?.userid || // ✅ sent by frontend during call
    request.headers.get("x-user-id") || // optional fallback
    payload.userid;

  console.log("user id", userid);

  const { type, role, level, techstack, amount } = payload;

  // 3. Validate all fields
  if (!type || !role || !level || !techstack || !amount || !userid) {
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
    // 4. Generate text using Gemini
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

    // 5. Store in Firestore
    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(","),
      questions: JSON.parse(questions),
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    console.log("intevriew obj", interview);

    await db.collection("interviews").add(interview);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("🔥 Error:", error);
    return Response.json(
      { success: false, error: "Invalid JSON from Gemini" },
      { status: 500 }
    );
  }

  // try {
  //   const { text: questions } = await generateText({
  //     model: google("gemini-2.0-flash-001"),
  //     prompt: `Prepare questions for a job interview.
  //       The job role is ${role}.
  //       The job experience level is ${level}.
  //       The tech stack used in the job is: ${techstack}.
  //       The focus between behavioural and technical questions should lean towards: ${type}.
  //       The amount of questions required is: ${amount}.
  //       Please return only the questions, without any additional text.
  //       The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
  //       Return the questions formatted like this:
  //       ["Question 1", "Question 2", "Question 3"]

  //       Thank you! <3
  //   `,
  //   });

  //   const interview = {
  //     role: role,
  //     type: type,
  //     level: level,
  //     techstack: techstack.split(","),
  //     questions: JSON.parse(questions),
  //     userId: userid,
  //     finalized: true,
  //     coverImage: getRandomInterviewCover(),
  //     createdAt: new Date().toISOString(),
  //   };

  //   await db.collection("interviews").add(interview);

  //   return Response.json({ success: true }, { status: 200 });
  // } catch (error) {
  //   console.error("Error:", error);
  //   return Response.json({ success: false, error: error }, { status: 500 });
  // }
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

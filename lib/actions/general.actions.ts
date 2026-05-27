"use server";

import { google } from "@ai-sdk/google";
import { generateText } from "ai";

import { db } from "../../firebase/admin";

export const getInterviewsByUserId = async (
  userId: string,
): Promise<Interview[] | null> => {
  if (!userId) return [];

  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)

    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc?.id,
    ...doc.data(),
  })) as Interview[];
};

export const getCompletedInterviewsByUserId = async (
  userId: string,
): Promise<Interview[] | null> => {
  if (!userId) return [];

  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .where("completed", "==", true)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc?.id,
    ...doc.data(),
  })) as Interview[];
};

// export const getLatestInterviews = async (
//   params: GetLatestInterviewsParams,
// ): Promise<Interview[] | null> => {
//   const { userId, limit = 20 } = params;

//   const interviews = await db
//     .collection("interviews")
//     .where("finalized", "==", true)
//     .where("userId", "!=", userId)
//     .orderBy("createdAt", "desc")
//     .limit(limit)
//     .get();

//   return interviews.docs.map((doc) => ({
//     id: doc?.id,
//     ...doc.data(),
//   })) as Interview[];
// };

export const getInterviewById = async (
  id: string,
): Promise<Interview | null> => {
  const interview = await db.collection("interviews").doc(id).get();

  return interview.data() as Interview;
};

export const createFeedback = async (params: CreateFeedbackParams) => {
  const { interviewId, userId, transcript } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `-${sentence.role}: ${sentence.content}\n`,
      )
      .join("");

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `
Return ONLY valid JSON in this exact format:

{
  "totalScore": 85,
  "categoryScores": [
    {
      "name": "Communication Skills",
      "score": 80,
      "comment": "Good communication"
    }
  ],
  "strengths": ["Good React knowledge"],
  "areasForImprovement": ["Improve confidence"],
  "finalAssessment": "Overall strong candidate"
}

Transcript:
${formattedTranscript}
`,
      system: "You are a professional interviewer analyzing a mock interview.",
    });

    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const {
      totalScore,
      categoryScores,
      strengths,
      areasForImprovement,
      finalAssessment,
    } = JSON.parse(cleanedText);
    const feedback = await db.collection("feedback").add({
      interviewId,
      userId,
      totalScore,
      categoryScores,
      strengths,
      areasForImprovement,
      finalAssessment,
      createdAt: new Date().toISOString(),
    });

    // Mark interview as completed
    await db.collection("interviews").doc(interviewId).update({
      completed: true,
    });

    return {
      success: true,
      feedbackId: feedback.id,
    };
  } catch (e) {
    console.error("Error saving feedback", e);

    return { success: false };
  }
};

export const getFeedbackByInterviewId = async (
  params: GetFeedbackByInterviewIdParams,
): Promise<Feedback | null> => {
  const { interviewId, userId } = params;

  const feedback = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (feedback.empty) return null;

  const feedbackDoc = feedback.docs[0];

  return {
    id: feedbackDoc.id,
    ...feedbackDoc.data(),
  } as Feedback;
};

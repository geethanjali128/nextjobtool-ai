"use server";

import { cookies } from "next/headers";
import { auth, db } from "../../firebase/admin";

// session duration (7 days in seconds)
const SESSION_DURATION = 60 * 60 * 24 * 7;

export const Signup = async (params: SignUpParams) => {
  const { uid, name, email } = params;

  try {
    // Check if a user with the same UID already exists in Firestore
    const userRecord = await db.collection("users").doc(uid).get();

    if (userRecord.exists) {
      return {
        success: false,
        message: "User already exists. Please Sign in instead",
      };
    }

    // Add new user to Firestore
    await db.collection("users").doc(uid).set({
      name,
      email,
    });

    // Return success message
    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (e: any) {
    console.error("Error in signup", e);

    // handling specifi error if email is already in use
    if (e.code === "auth/email-already-exists") {
      return {
        success: false,
        message: "This email already in use.",
      };
    }

    // general error fallback
    return {
      success: false,
      message: "Failed to create an account",
    };
  }
};

export const Signin = async (params: SignInParams) => {
  const { email, idToken } = params;

  try {
    // Check if a user with this email exists in Firebase Auth
    const userRecord = await auth.getUserByEmail(email);

    // If the user is not found in Firebase Auth, return an error message
    if (!userRecord) {
      return {
        success: false,
        message: "User does not exist. Create an account.",
      };
    }

    //   If the user exists, create a session cookie using their ID token
    await setSessionCookie(idToken);

    // Return a success response
    return {
      success: true,
      message: "User signed in successfully.",
    };
  } catch (e) {
    console.error("Sign-in error:", e);

    return {
      success: false,
      message: "Fialed to log into  account.Please tyr again.",
    };
  }
};

export const setSessionCookie = async (idToken: string) => {
  // Get access to the cookie store (Next.js App Router)
  const cookieStore = await cookies();

  // Create a session cookie using Firebase Admin SDK
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000,
  });

  // Set the session cookie in the user's browser
  cookieStore.set("session", sessionCookie, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/", // Cookie valid across entire site
    sameSite: "lax",
  });
};

// Returns the current logged-in user or null
export const getCurrentUser = async (): Promise<User | null> => {
  // Get access to the cookie store from the current request
  const cookieStore = await cookies();

  // Read the 'session' cookie value
  const sessionCookie = cookieStore.get("session")?.value;

  // If no session cookie, user is not logged in
  if (!sessionCookie) return null;

  try {
    // verify session cookie
    const decodedCliams = await auth.verifySessionCookie(sessionCookie, true);

    // Fetch user data from Firestore using UID
    const userRecord = await db
      .collection("users")
      .doc(decodedCliams.uid)
      .get();

    if (!userRecord.exists) return null;

    // Return user data with ID
    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const isAuthenticated = async () => {
  const user = await getCurrentUser();

  return !!user;
};

export const getInterviewsByUserId = async (
  userId: string
): Promise<Interview[] | null> => {
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

export const getLatestInterviews = async (
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> => {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc?.id,
    ...doc.data(),
  })) as Interview[];
};

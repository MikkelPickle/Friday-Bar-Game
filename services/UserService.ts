import { httpsCallable } from "firebase/functions";
import { functions, db } from "../config/firebase.config";
import { doc, onSnapshot } from "firebase/firestore";
import ScoreData from "../types/scoreTypes";


/// ------- User --------

// --- ADD NEW USER TO DATABASE ---
export async function addNewUser(name: string, study: string) {
  try {
    const addUser = httpsCallable(functions, "addNewUser");
    const result = await addUser({ name, study });
    const data = result.data as { success: boolean };
    if (data.success) {
      console.log("Added user:", name);
      return true;
    } else {
      console.log("Failed to add user:", name);
      return false;
    }
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
}

// --- CHECK IF USER EXISTS ---
export async function checkIfUserExists() {
  try {
    const checkUser = httpsCallable(functions, "checkIfUserExists");
    const result = await checkUser({});
    const data = result.data as { exists: boolean };
    console.log("User exists:", data.exists);
    return data.exists as boolean;
  } catch (error) {
    console.error("Error checking user:", error);
    throw error;
  }
}

// --- SUBMIT SCORE ---
export async function updateScore(score: number) {
  try {
    const updateScoreFn = httpsCallable(functions, "updateScore");
    const result = await updateScoreFn({ score });
    const data = result.data as { success: boolean; score: number };
    console.log("Updated score:", data.score);
    return data.score;
  } catch (error) {
    console.error("Error saving score:", error);
    throw error;
  }
}

// --- RETRIEVE SCORE ---
export async function loadScore() {
  try {
    const loadScoreCallable = httpsCallable(functions, "loadScore");
    const result = await loadScoreCallable({});
    const data = result.data as { score: number };
    console.log("Loaded score:", data.score);
    return data.score;
  } catch (error) {
    console.error("Error fetching score:", error);
    throw error;
  }
}

// --- RETRIEVE ALL SCORES ---
export async function loadAllScores(study: string) {
  console.log("[loadAllScores] called with study:", study);

  // Ensure we send either a trimmed string or undefined
  const studyParam = study?.trim() || undefined;

  const loadAllScoresCallable = httpsCallable(functions, "loadAllScores");

  try {
    console.log("[loadAllScores] sending request with payload:", { study: studyParam });
    const result = await loadAllScoresCallable({ study: studyParam });

    // Log the raw result object
    console.log("[loadAllScores] raw result:", result);

    // Type-safe extraction
    if (!result?.data) {
      console.warn("[loadAllScores] No data received in result", result);
      return { allScores: [], studyScores: [] };
    }

    const data = result.data as {
      success: boolean;
      allScores: ScoreData[];
      studyScores: ScoreData[];
      [key: string]: any; // allow extra fields for debugging
    };

    console.log(
      "[loadAllScores] Parsed data:",
      "success =", data.success,
      "allScores.length =", data.allScores?.length,
      "studyScores.length =", data.studyScores?.length
    );

    // Extra debug: log first few entries if large
    if (data.allScores?.length) console.log("[loadAllScores] AllScores preview:", data.allScores.slice(0, 5));
    if (data.studyScores?.length) console.log("[loadAllScores] StudyScores preview:", data.studyScores.slice(0, 5));

    return { allScores: data.allScores || [], studyScores: data.studyScores || [] };
  } catch (error: any) {
    // Enhanced error logging
    console.error("[loadAllScores] Error fetching scores:", {
      errorMessage: error?.message,
      errorCode: error?.code,
      stack: error?.stack,
      fullError: error,
      study: studyParam,
    });

    // Optional: inspect Firebase callable error format
    if (error?.details) {
      console.error("[loadAllScores] Error details:", error.details);
    }

    throw error;
  }
}


// TEsting 
export async function seedUsers() {
  try {
    const seedUsersCallable = httpsCallable(functions, "seedUsers");
    const result = await seedUsersCallable({});
    const data = result.data as { success: boolean, message: string };
    console.log("Seeded users successfully", data.success);
    return data;
  } catch (error) {
    console.error("Error seeding users:", error);
    throw error;
  }
}


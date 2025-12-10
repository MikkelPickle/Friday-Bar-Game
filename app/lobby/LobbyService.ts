import { httpsCallable } from "firebase/functions";
import { functions, db } from "../../config/firebase.config";
import { doc, onSnapshot } from "firebase/firestore";
import ScoreData from "../../components/scoreTypes";

export default async function createNewLobby(playerName: string) {
  console.log("Trying to create new lobby");
  try {
    const createLobby = httpsCallable(functions, "createLobby");
    const result = await createLobby({ creatorName: playerName }); // pass the name here
    console.log("Created new lobby!!!");
    const { lobbyId, gamePin } = result.data as { lobbyId: string; gamePin: number };

    console.log("Lobby created:", lobbyId, "with PIN:", gamePin);
    return { lobbyId, gamePin };
  } catch (error) {
    console.error("Error creating lobby:", error);
    throw error;
  }
}

export async function joinExistingLobby(pin: number, playerName: string) {
  try {
    const joinLobby = httpsCallable(functions, "joinLobby");
    const result = await joinLobby({ pin, playerName });

    const { lobbyId, players } = result.data as {
      lobbyId: string;
      pin: number;
      players: { name: string }[];
    };

    console.log("Joined lobby:", lobbyId, "Players:", players);
    return { lobbyId, players };
  } catch (error: any) {
    console.error("Error joining lobby:", error);

    if (error?.message?.includes("Lobby expired")) {
      alert("This lobby has expired. Please create a new one.");
      return null;
    }

    throw error;
  }
}

export function subscribeToLobby(lobbyId: string, callback: (data: any) => void) {
  const lobbyRef = doc(db, "lobbies", lobbyId);

  // Listen for real-time updates
  const unsubscribe = onSnapshot(lobbyRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    } else {
      console.warn("Lobby no longer exists");
      callback(null);
    }
  });

  return unsubscribe; // call this when you want to stop listening
}

export async function leaveLobby(lobbyId: string, playerName: string) {
  try {
    const leaveLobbyCallable = httpsCallable(functions, "leaveLobby");
    const result = await leaveLobbyCallable({ lobbyId, playerName });

    console.log("Left lobby successfully", result.data);
    return result.data;
  } catch (error) {
    console.error("Error leaving lobby:", error);
    throw error;
  }
}



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


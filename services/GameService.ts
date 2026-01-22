import { httpsCallable } from "firebase/functions";
import { functions, db } from "../config/firebase.config";
import { doc, onSnapshot, Unsubscribe } from "firebase/firestore";
import { GameState, Intensity, StartGameRequest, NextChallengeRequest, EndGameRequest } from "../types/GameTypes";

// ---------------------------------------------------------
// Start Game
// ---------------------------------------------------------
export async function startGame(
  lobbyId: string,
  playerUid: string,
  intensity: Intensity
): Promise<{ success: boolean }> {
  try {
    const startGameFn = httpsCallable(functions, "startGame");
    const result = await startGameFn({ lobbyId, playerUid, intensity } as StartGameRequest);
    return result.data as { success: boolean };
  } catch (error) {
    console.error("Error starting game:", error);
    throw error;
  }
}

// ---------------------------------------------------------
// Next Challenge
// ---------------------------------------------------------
export async function nextChallenge(
  lobbyId: string,
  playerUid: string
): Promise<{ success: boolean; finished: boolean }> {
  try {
    const nextChallengeFn = httpsCallable(functions, "nextChallenge");
    const result = await nextChallengeFn({ lobbyId, playerUid } as NextChallengeRequest);
    return result.data as { success: boolean; finished: boolean };
  } catch (error) {
    console.error("Error advancing challenge:", error);
    throw error;
  }
}

// ---------------------------------------------------------
// End Game
// ---------------------------------------------------------
export async function endGame(
  lobbyId: string,
  playerUid: string
): Promise<{ success: boolean }> {
  try {
    const endGameFn = httpsCallable(functions, "endGame");
    const result = await endGameFn({ lobbyId, playerUid } as EndGameRequest);
    return result.data as { success: boolean };
  } catch (error) {
    console.error("Error ending game:", error);
    throw error;
  }
}

// ---------------------------------------------------------
// Subscribe to Game State
// ---------------------------------------------------------
export function subscribeToGameState(
  lobbyId: string,
  callback: (gameState: GameState | null) => void
): Unsubscribe {
  const gameStateRef = doc(db, "lobbies", lobbyId, "gameState", "current");

  const unsubscribe = onSnapshot(gameStateRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as GameState);
    } else {
      callback(null);
    }
  });

  return unsubscribe;
}

// ---------------------------------------------------------
// Seed Challenges (for admin use)
// ---------------------------------------------------------
export async function seedChallenges(): Promise<{ success: boolean; count: number }> {
  try {
    const seedFn = httpsCallable(functions, "seedChallenges");
    const result = await seedFn({});
    return result.data as { success: boolean; count: number };
  } catch (error) {
    console.error("Error seeding challenges:", error);
    throw error;
  }
}

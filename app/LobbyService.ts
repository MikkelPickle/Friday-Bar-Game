import { httpsCallable } from "firebase/functions";
import { functions, db } from "../config/firebase.config";
import { doc, onSnapshot } from "firebase/firestore";

export default async function createNewLobby(lobbyName: string) {
  try {
    const createLobby = httpsCallable(functions, "createLobby");
    const result = await createLobby({ lobbyName });

    // result.data contains what we returned in the function
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
  } catch (error) {
    console.error("Error joining lobby:", error);
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
    }
  });

  return unsubscribe; // call this when you want to stop listening
}

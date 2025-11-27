import { httpsCallable } from "firebase/functions";
import { functions, db } from "../config/firebase.config";
import { doc, onSnapshot } from "firebase/firestore";

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

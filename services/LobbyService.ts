import { httpsCallable } from "firebase/functions";
import { functions, db } from "../config/firebase.config";
import { doc, onSnapshot, DocumentData, Unsubscribe } from "firebase/firestore";
import { Lobby, CreateLobbyResponse, JoinLobbyResponse } from "../types/LobbyTypes";

// ---------------------------------------------------------
// Create new lobby
// ---------------------------------------------------------
export default async function createNewLobby(playerName: string): Promise<CreateLobbyResponse> {
  try {
    const createLobby = httpsCallable(functions, "createLobby");
    const result = await createLobby({ creatorName: playerName });

    const { lobbyId: returnedLobbyId ,gamePin: returnedPin, uid: returnedUid } = result.data as CreateLobbyResponse;
    console.log("Lobby created!", "with PIN:", returnedPin);

    return { lobbyId: returnedLobbyId, gamePin: returnedPin, uid: returnedUid };
  } catch (error) {
    console.error("Error creating lobby:", error);
    throw error;
  }
}

// ---------------------------------------------------------
// Join existing lobby
// ---------------------------------------------------------
export async function joinExistingLobby(pin: number, playerName: string): Promise<JoinLobbyResponse | null> {
  try {
    const joinLobby = httpsCallable(functions, "joinLobby");
    const result = await joinLobby({ pin, playerName });

    const { lobbyId: returnedLobbyId, gamePin: returnedPin, players: returnedPlayers, uid: returnedUid } = result.data as JoinLobbyResponse;
    console.log("Joined lobby!", "Players:", returnedPlayers);

    return { lobbyId: returnedLobbyId, gamePin: returnedPin, players: returnedPlayers, uid: returnedUid };
  } catch (error: any) {
    console.error("Error joining lobby:", error);

    if (error?.message?.includes("Lobby has expired")) {
      alert("This lobby has expired. Please create a new one.");
      return null;
    }

    throw error;
  }
}

// ---------------------------------------------------------
// Subscribe to lobby real-time updates
// ---------------------------------------------------------
export function subscribeToLobby(
  lobbyId: string,
  callback: (data: Lobby | null) => void
): Unsubscribe {
  const lobbyRef = doc(db, "lobbies", lobbyId);

  const unsubscribe = onSnapshot(lobbyRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data() as DocumentData;
      callback({
        lobbyId: data.lobbyId,
        gamePin: data.pin,
        createdAt: data.createdAt,
        expiresAt: data.expiresAt,
        players: data.players,
      });
    } else {
      console.warn("Lobby no longer exists");
      callback(null);
    }
  });

  return unsubscribe;
}

// ---------------------------------------------------------
// Leave lobby
// ---------------------------------------------------------
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



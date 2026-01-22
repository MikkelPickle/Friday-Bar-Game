import { httpsCallable } from "firebase/functions";
import { functions, db, storage } from "../config/firebase.config";
import { doc, onSnapshot, DocumentData, Unsubscribe } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Lobby, CreateLobbyResponse, JoinLobbyResponse } from "../types/LobbyTypes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Directory, File, Paths } from "expo-file-system";
import * as Crypto from 'expo-crypto';

// ---------------------------------------------------------
// Create new lobby
// ---------------------------------------------------------
export default async function createNewLobby(playerName: string): Promise<CreateLobbyResponse> {
  try {
    const uuid = Crypto.randomUUID();
    console.log("UUID:", uuid);
    const avatarUrl = await uploadProfileImage(uuid);
    const createLobby = httpsCallable(functions, "createLobby");
    const result = await createLobby({ creatorName: playerName, avatarUrl: avatarUrl });

    const { lobbyId: returnedLobbyId ,gamePin: returnedPin, uid: returnedUid } = result.data as CreateLobbyResponse;
    console.log("Lobby created!", "with PIN:", returnedPin);

    // Store playerUid in AsyncStorage for later use
    await AsyncStorage.setItem("playerUid", returnedUid);

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
    const uuid = Crypto.randomUUID();
    console.log("UUID:", uuid);
    const avatarUrl = await uploadProfileImage(uuid);
    const joinLobby = httpsCallable(functions, "joinLobby");
    const result = await joinLobby({ pin, playerName, avatarUrl });

    const { lobbyId: returnedLobbyId, gamePin: returnedPin, players: returnedPlayers, uid: returnedUid } = result.data as JoinLobbyResponse;
    console.log("Joined lobby!", "Players:", returnedPlayers);

    // Store playerUid in AsyncStorage for later use
    await AsyncStorage.setItem("playerUid", returnedUid);

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
        gameStatus: data.gameStatus,
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

// Helper to create blob using XMLHttpRequest (React Native compatible)
function uriToBlob(uri: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.response);
    xhr.onerror = () => reject(new Error("Failed to convert URI to Blob"));
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });
}

// Upload local image to Storage and get URL
export async function uploadProfileImage(playerUid: string) {
  try {
    const fileExtension = await AsyncStorage.getItem("fileExtension");
    if (fileExtension !== null) { //load profile picture
        const directory = new Directory(Paths.cache, "profile");
        const file = new File(directory, fileExtension);
        const storageRef = ref(storage, `lobbies/avatars/${playerUid}`+ "/" + `${fileExtension}`);
        console.log("StorageRef:", storageRef);
        const metadata = {contentType: 'image/'+`${fileExtension}`};
        const bytes = await uriToBlob(file.uri);
        await uploadBytes(storageRef, bytes, metadata);
        const url = await getDownloadURL(storageRef);
        return url;
    }
    return;
  } catch (err) {
    console.error("Failed to upload profile image:", err);
    return null;
  }
}
import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";

initializeApp();
const db = getFirestore();

// Helper to generate random 6-digit PIN
function generatePin(): number {
  return Math.floor(100000 + Math.random() * 900000);
}

// Helper to check if a PIN already exists in active lobbies
async function pinExists(pin: number): Promise<boolean> {
  const snapshot = await db.collection("lobbies")
    .where("pin", "==", pin)
    .limit(1)
    .get();
  return !snapshot.empty;
}



export const createLobby = onCall(async (req) => {
  const { lobbyName } = req.data;

  // Generate unique PIN
  let gamePin: number;
  do {
    gamePin = generatePin();
  } while (await pinExists(gamePin));

  // Create lobby doc
  const lobbyRef = db.collection("lobbies").doc();
  await lobbyRef.set({
    name: lobbyName,
    pin: gamePin,
    createdAt: new Date(),
    players: [],
  });

  logger.info("Lobby created", { lobbyName, gamePin });

  return { lobbyId: lobbyRef.id, gamePin };
});



export const joinLobby = onCall(async (req) => {
  const { pin, playerName } = req.data;

  if (!pin || !playerName) {
    throw new Error("Missing pin or playerName");
  }

  // Find the lobby with this PIN
  const snapshot = await db.collection("lobbies")
    .where("pin", "==", pin)
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw new Error("Lobby not found");
  }

  const lobbyDoc = snapshot.docs[0];
  const lobbyData = lobbyDoc.data();

  // Prevent too many players (max 8)
  if (lobbyData.players.length >= 8) {
    throw new Error("Lobby is full");
  }

  // Add player to lobby
  const updatedPlayers = [...lobbyData.players, { name: playerName }];
  await lobbyDoc.ref.update({ players: updatedPlayers });

  return {
    lobbyId: lobbyDoc.id,
    pin: lobbyData.pin,
    players: updatedPlayers,
  };
});


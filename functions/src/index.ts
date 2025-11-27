import { onCall } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
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
  const snapshot = await db
    .collection("lobbies")
    .where("pin", "==", pin)
    .limit(1)
    .get();
  return !snapshot.empty;
}

// ✅ Create lobby
export const createLobby = onCall(async (request) => {
  const { creatorName } = request.data;
  logger.info("createLobby called", { requestData: request.data });

  if (!creatorName || typeof creatorName !== "string") {
    logger.error("Invalid creatorName", { creatorName });
    throw new Error("Creator name is required");
}

  // Generate unique PIN
  let gamePin: number;
  do {
    gamePin = generatePin();
  } while (await pinExists(gamePin));

  // Auto-expire in 1 hour
  const expiresAt = Date.now() + 60 * 60 * 1000;

  const lobbyRef = db.collection("lobbies").doc();
  await lobbyRef.set({
    pin: gamePin,
    createdAt: Date.now(),
    expiresAt,
    players: [{ name: creatorName }],
  });

  logger.info("Lobby created", { lobbyId: lobbyRef.id, gamePin });
  return { lobbyId: lobbyRef.id.toString(), gamePin: Number(gamePin) };
});

// ✅ Join lobby
export const joinLobby = onCall(async (req) => {
  const { pin, playerName } = req.data;

  if (!pin || !playerName) {
    throw new Error("Missing pin or playerName");
  }

  const snapshot = await db
    .collection("lobbies")
    .where("pin", "==", pin)
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw new Error("Lobby not found");
  }

  const lobbyDoc = snapshot.docs[0];
  const lobbyData = lobbyDoc.data();

  // Check expiration
  if (lobbyData.expiresAt < Date.now()) {
    await lobbyDoc.ref.delete();
    throw new Error("Lobby expired");
  }

  if (lobbyData.players.length >= 8) {
    throw new Error("Lobby is full");
  }

  const updatedPlayers = [...lobbyData.players, { name: playerName }];
  await lobbyDoc.ref.update({ players: updatedPlayers });

  return {
    lobbyId: lobbyDoc.id,
    pin: lobbyData.pin,
    players: updatedPlayers,
  };
});

// ✅ Cleanup expired lobbies (runs every 30 minutes)
export const cleanupLobbies = onSchedule("every 30 minutes", async () => {
  const now = Date.now();
  const snapshot = await db
    .collection("lobbies")
    .where("expiresAt", "<", now)
    .get();

  if (snapshot.empty) {
    logger.info("No expired lobbies found");
    return;
  }

  const batch = db.batch();
  snapshot.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();

  logger.info(`Deleted ${snapshot.size} expired lobbies`);
});

// ✅ Leave lobby
export const leaveLobby = onCall(async (req) => {
  const { lobbyId, playerName } = req.data;

  if (!lobbyId || !playerName) {
    throw new Error("Missing lobbyId or playerName");
  }

  const lobbyRef = db.collection("lobbies").doc(lobbyId);
  const lobbyDoc = await lobbyRef.get();

  if (!lobbyDoc.exists) {
    throw new Error("Lobby not found");
  }

  const lobbyData = lobbyDoc.data();
  if (!lobbyData || !Array.isArray(lobbyData.players)) {
    throw new Error("Invalid lobby data");
  }

  const updatedPlayers = lobbyData.players.filter(
    (p: { name: string }) => p.name !== playerName
  );

  await lobbyRef.update({ players: updatedPlayers });

  logger.info(`Player ${playerName} left lobby ${lobbyId}`);
  return { success: true };
});
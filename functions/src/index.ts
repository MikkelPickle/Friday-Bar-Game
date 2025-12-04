import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
// Note to myself: USE EXPLICIT IMPORTS!!!

initializeApp();
const db = getFirestore();

// ------ LOBBY ------


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
    throw new HttpsError("invalid-argument", "Creator name is required");
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
    throw new HttpsError("invalid-argument","Missing pin or playerName");
  }

  const snapshot = await db
    .collection("lobbies")
    .where("pin", "==", pin)
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw new HttpsError("not-found", "Lobby not found");
  }

  const lobbyDoc = snapshot.docs[0];
  const lobbyData = lobbyDoc.data();

  // Check expiration
  if (lobbyData.expiresAt < Date.now()) {
    await lobbyDoc.ref.delete();
    //https error 
    throw new HttpsError("permission-denied", "Lobby has expired");
  }

  if (lobbyData.players.length >= 8) {
    throw new HttpsError("resource-exhausted", "Lobby is full");
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
    throw new HttpsError("invalid-argument", "Missing lobbyId or playerName");
  }

  const lobbyRef = db.collection("lobbies").doc(lobbyId);
  const lobbyDoc = await lobbyRef.get();

  if (!lobbyDoc.exists) {
    throw new HttpsError("not-found", "Lobby not found");
  }

  const lobbyData = lobbyDoc.data();
  if (!lobbyData || !Array.isArray(lobbyData.players)) {
    throw new HttpsError("internal", "Invalid lobby data");
  }

  const updatedPlayers = lobbyData.players.filter(
    (p: { name: string }) => p.name !== playerName
  );

  await lobbyRef.update({ players: updatedPlayers });

  logger.info(`Player ${playerName} left lobby ${lobbyId}`);
  return { success: true };
});


// -------- USER --------


type Score = {
  name: string;
  score: number;
  study: string;
};

// Helper: get trusted email for a uid via Admin SDK
async function getAuthEmailForUid(uid: string): Promise<string | null> {
  try {
    const user = await getAuth().getUser(uid);
    return user.email ?? null;
  } catch (err) {
    // If the user isn't found, bubble up a controlled error to the caller
    throw new HttpsError("not-found", "Auth user not found");
  }
}

/**
 * checkIfUserExists
 * Request: { uid: string }
 * Response: { exists: boolean }
 */
export const checkIfUserExists = onCall(async (req) => {
  const uid = req.data.uid;
  if (!uid || typeof uid !== "string") {
    throw new HttpsError("invalid-argument", "Missing or invalid uid");
  }

  const userRef = db.collection("users").doc(uid);
  const userDoc = await userRef.get();
  return { exists: userDoc.exists };
});

/**
 * addNewUser
 * Request: { uid: string, name: string, email?: string, study?: string }
 * - If email provided it will be verified against Auth email (trusted).
 * - If email omitted we use the Auth email.
 * - Uses merge:true so it won't wipe existing fields.
 */
export const addNewUser = onCall(async (req) => {
  const { uid, name, email: providedEmail, study } = req.data;

  if (!uid || typeof uid !== "string") {
    throw new HttpsError("invalid-argument", "Missing or invalid uid");
  }
  if (!name || typeof name !== "string") {
    throw new HttpsError("invalid-argument", "Missing or invalid name");
  }

  // Get trusted email from Auth
  const authEmail = await getAuthEmailForUid(uid);

  if (!authEmail) {
    throw new HttpsError("failed-precondition", "Auth user has no email");
  }

  // If the client provided an email, ensure it matches the auth email (prevent spoofing)
  if (providedEmail && providedEmail !== authEmail) {
    throw new HttpsError("permission-denied", "Provided email does not match authentication email");
  }

  const userRef = db.collection("users").doc(uid);

  // Use merge true to avoid accidentally wiping fields
  await userRef.set(
    {
      uid,
      email: authEmail,
      username: name,
      score: 0,
      study,
      createdAt: Date.now(),
    },
    { merge: true }
  );

  return { success: true };
});

/**
 * updateScore
 * Request: { uid: string, score: number }
 * - Validates with Auth email
 * - Updates only if the new score is higher
 * - Uses transaction to avoid race conditions
 */
export const updateScore = onCall(async (req) => {
  const { uid, score } = req.data;

  if (!uid || typeof uid !== "string") {
    throw new HttpsError("invalid-argument", "Missing or invalid uid");
  }
  if (typeof score !== "number" || !isFinite(score) || score < 0) {
    throw new HttpsError("invalid-argument", "Missing or invalid score");
  }

  // Get trusted email (throws if not found)
  const authEmail = await getAuthEmailForUid(uid);

  const userRef = db.collection("users").doc(uid);

  try {
    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(userRef);

      if (!doc.exists) {
        throw new HttpsError("not-found", "User document not found");
      }
      const docData = doc.data() as any;
      const storedEmail = docData.email;

      if (!storedEmail || storedEmail !== authEmail) {
        throw new HttpsError("permission-denied", "Email mismatch");
      }

      const currentScore = typeof docData.score === "number" ? docData.score : 0;

      // Only update when the incoming score is strictly higher
      if (score > currentScore) {
        transaction.set(userRef, { score }, { merge: true });
      }
    });

    return { success: true, score };
  } catch (err) {
    if (err instanceof HttpsError) throw err;
    console.error("updateScore error:", err);
    throw new HttpsError("internal", "Failed to update score");
  }
});

/**
 * loadScore
 * Request: { uid: string }
 * Response: { score: number }
 * - Validates with Auth email
 */
export const loadScore = onCall(async (req) => {
  const uid = req.data.uid;
  if (!uid || typeof uid !== "string") {
    throw new HttpsError("invalid-argument", "Missing or invalid uid");
  }

  const authEmail = await getAuthEmailForUid(uid);
  const userRef = db.collection("users").doc(uid);
  const doc = await userRef.get();

  if (!doc.exists) {
    throw new HttpsError("not-found", "User not found");
  }

  const docData = doc.data() as any;
  if (!docData.email || docData.email !== authEmail) {
    throw new HttpsError("permission-denied", "Email mismatch");
  }

  const score = typeof docData.score === "number" ? docData.score : 0;
  return { score };
});

/**
 * loadAllScores
 * Request optional: { limit?: number, study?: string }
 * Response: { success: boolean, scores: Score[] }
 *
 * - Returns top scores ordered by score desc.
 * - Use a small limit by default to keep payload small.
 */
export const loadAllScores = onCall(async (req) => {
  const limit = 20;
  logger.info("Loading all scores", { study: req.data.study });

  // Normalize study filter
  const studyFilter =
    typeof req.data?.study === "string" && req.data.study.trim().length > 0
      ? req.data.study.trim()
      : null;

  logger.info("Study filter", { studyFilter });

  const allScores: Score[] = [];
  const studyScores: Score[] = [];

  try {
    // --- Top 20 overall ---
    let allSnapshot;
    try {
      allSnapshot = await db
        .collection("users")
        .orderBy("score", "desc")
        .limit(limit)
        .get();
      logger.info("Fetched overall top scores", { count: allSnapshot.size });
    } catch (err) {
      logger.error("Error fetching overall scores", err);
      throw new HttpsError("internal", "Failed to fetch overall scores");
    }

    allSnapshot.forEach((doc) => {
      const data = doc.data() as any;
      if (
        typeof data.username === "string" &&
        typeof data.score === "number" &&
        typeof data.study === "string"
      ) {
        allScores.push({
          name: data.username,
          score: data.score,
          study: data.study,
        });
      } else {
        logger.warn("Invalid user document skipped", { id: doc.id, data });
      }
    });

    // --- Top 20 filtered by study ---
    if (studyFilter) {
      let studySnapshot;
      try {
        studySnapshot = await db
          .collection("users")
          .where("study", "==", studyFilter)
          .orderBy("score", "desc")
          .limit(limit)
          .get();
        logger.info("Fetched study-filtered scores", { studyFilter, count: studySnapshot.size });
      } catch (err) {
        logger.error("Error fetching study-filtered scores", { studyFilter, error: err });
        throw new HttpsError(
          "internal",
          `Failed to fetch scores for study ${studyFilter}`
        );
      }

      studySnapshot.forEach((doc) => {
        const data = doc.data() as any;
        if (
          typeof data.username === "string" &&
          typeof data.score === "number" &&
          typeof data.study === "string"
        ) {
          studyScores.push({
            name: data.username,
            score: data.score,
            study: data.study,
          });
        } else {
          logger.warn("Invalid user document skipped in study filter", { id: doc.id, data });
        }
      });
    }

    return { success: true, allScores, studyScores };
  } catch (err) {
    // This catch now only handles unexpected errors outside the two queries
    logger.error("Unexpected loadAllScores error", err);
    throw new HttpsError(
      "internal",
      "Unexpected error while loading scores"
    );
  }
});


// Testing


// Only seed when called manually (emulator)
export const seedUsers = onCall(async () => {
  if (process.env.FUNCTIONS_EMULATOR !== "true") {
    throw new HttpsError("failed-precondition", "Seeding only allowed in emulator");
  }

  const dummyUsers = [
    { uid: "dummy1", email: "dummy1@example.com", username: "Alice", score: 90, study: "cs" },
    { uid: "dummy2", email: "dummy2@example.com", username: "Bob", score: 85, study: "math" },
    { uid: "dummy3", email: "dummy3@example.com", username: "Charlie", score: 92, study: "science" },
  ];

  for (const user of dummyUsers) {
    await db.collection("users").doc(user.uid).set({
      ...user,
      createdAt: Date.now(),
    });
  }

  return { success: true, message: "Seeding complete!" };
});


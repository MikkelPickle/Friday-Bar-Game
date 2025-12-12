import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { v4 as uuidv4 } from "uuid";
// Note to myself: USE EXPLICIT IMPORTS!!!

initializeApp();
const db = getFirestore();





// ------ LOBBY ------




// --- Player object inside a lobby ---
interface LobbyPlayer {
  name: string;
  uid: string;
  isLeader: boolean;
}

// --- The structure of a lobby in Firestore ---
interface Lobby {
  lobbyId: string;
  gamePin: number;
  createdAt: number;
  expiresAt: number;
  players: LobbyPlayer[];
}

// --- Response from createLobby ---
interface CreateLobbyResponse {
  lobbyId: string;
  gamePin: number;
  uid: string;
}

// --- Response from joinLobby ---
interface JoinLobbyResponse {
  lobbyId: string;
  gamePin: number;
  players: LobbyPlayer[];
  uid: string;
}

function generatePin(): number {
  return Math.floor(100000 + Math.random() * 900000);
}

async function pinExists(pin: number): Promise<boolean> {
  const snap = await db
    .collection("lobbies")
    .where("pin", "==", pin)
    .limit(1)
    .get();

  return !snap.empty;
}

function isExpired(expiresAt: number): boolean {
  return expiresAt < Date.now();
}

function makeUniquePlayerName(
  players: LobbyPlayer[],
  desiredName: string
): string {
  if (!players.some((p) => p.name === desiredName)) {
    return desiredName; // Name is unique
  }

  // Find a unique suffix
  let counter = 1;
  let uniqueName = `${desiredName}(${counter})`;
  while (players.some((p) => p.name === uniqueName)) {
    counter++;
    uniqueName = `${desiredName}(${counter})`;
  }

  return uniqueName;
}

function generatePlayerUid(): string {
  return uuidv4();
}

function addFakePlayers(
  lobby: Lobby,
  count: number
): Lobby {
  let updatedPlayers = [...lobby.players];

  for (let i = 0; i < count; i++) {
    if (updatedPlayers.length >= 8) break; // max capacity

    const fakeBaseName = `Player${i + 1}`;
    const uniqueName = makeUniquePlayerName(updatedPlayers, fakeBaseName);

    updatedPlayers.push({
      name: uniqueName,
      uid: generatePlayerUid(),
      isLeader: false,
    });
  }

  return { ...lobby, players: updatedPlayers };
}

// ---------------------------------------------------------
// Create Lobby
// ---------------------------------------------------------
export const createLobby = onCall(async (req): Promise<CreateLobbyResponse> => {
  const { creatorName } = req.data;
  if (!creatorName || typeof creatorName !== "string") {
    throw new HttpsError("invalid-argument", "creatorName is required");
  }

  let gamePin: number;
  do gamePin = generatePin();
  while (await pinExists(gamePin));

  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + 2 * 60 * 60 * 1000);
  const lobbyRef = db.collection("lobbies").doc();
  const playerUid: string = generatePlayerUid();
  console.log(createdAt);
  console.log(expiresAt);

  var lobby: Lobby = {
    lobbyId: lobbyRef.id,
    gamePin: gamePin,
    createdAt: createdAt.getTime(),
    expiresAt: expiresAt.getTime(), // 2 hours
    players: [{ name: creatorName, uid: playerUid, isLeader: true }],
  };


  lobby = addFakePlayers(lobby, 7);

  await lobbyRef.set(lobby);

  // Return the creator's UID so frontend can store it
  return { lobbyId: lobbyRef.id, gamePin: gamePin, uid: playerUid };
});



// ---------------------------------------------------------
// Join Lobby
// ---------------------------------------------------------
export const joinLobby = onCall(async (req): Promise<JoinLobbyResponse> => {
  const { pin, playerName } = req.data;

  if (!pin || typeof playerName !== "string") {
    throw new HttpsError("invalid-argument", "Missing pin or playerName");
  }

  const lobbyQuery = db.collection("lobbies").where("pin", "==", pin).limit(1);
  const snap = await lobbyQuery.get();
  if (snap.empty) throw new HttpsError("not-found", "Lobby not found");
  const lobbyDoc = snap.docs[0];

  const result: JoinLobbyResponse = await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(lobbyDoc.ref);
    const lobby = doc.data() as Lobby;

    if (isExpired(lobby.expiresAt)) {
      transaction.delete(doc.ref);
      throw new HttpsError("permission-denied", "Lobby has expired");
    }

    if (lobby.players.length >= 8) {
      throw new HttpsError("resource-exhausted", "Lobby is full");
    }

    const uniqueName = makeUniquePlayerName(lobby.players, playerName);
    const playerUid = generatePlayerUid();

    const updatedPlayers: LobbyPlayer[] = [
      ...lobby.players,
      { name: uniqueName, uid: playerUid, isLeader: false },
    ];

    assert(updatedPlayers.findLastIndex((p) => !p.isLeader), "permission-denied", "Can't be leader");

    transaction.update(doc.ref, { players: updatedPlayers });

    return {lobbyId: lobby.lobbyId, gamePin: lobby.gamePin, players: updatedPlayers, uid: playerUid };
  });

  return result;
});



// ---------------------------------------------------------
// Leave Lobby
// ---------------------------------------------------------
export const leaveLobby = onCall(
  async (req): Promise<{ success: true; message?: string }> => {
    const { lobbyId, playerUid } = req.data;

    if (typeof lobbyId !== "string" || typeof playerUid !== "string") {
      throw new HttpsError("invalid-argument", "Missing lobbyId or playerUid");
    }

    const ref = db.collection("lobbies").doc(lobbyId);

    const result: { success: true; message?: string } = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(ref);
      if (!doc.exists) throw new HttpsError("not-found", "Lobby not found");

      const lobby = doc.data() as Lobby;
      const leavingPlayer = lobby.players.find((p) => p.uid === playerUid);

      if (!leavingPlayer)
        throw new HttpsError("not-found", "Player not in lobby");

      if (leavingPlayer.isLeader) {
        // Leader left → delete lobby
        transaction.delete(ref);
        return { success: true, message: "Leader left, lobby closed" };
      }

      const updatedPlayers = lobby.players.filter((p) => p.uid !== playerUid);
      transaction.update(ref, { players: updatedPlayers });

      return { success: true, message: "Player left" };
    });

    return result;
  }
);



// ---------------------------------------------------------
// Cleanup Expired Lobbies
// ---------------------------------------------------------
export const cleanupLobbies = onSchedule(
  {
    schedule: "every 30 minutes",
    timeZone: "Etc/UTC",
  },
  async () => {
    const now = Date.now();
    const snap = await db.collection("lobbies")
      .where("expiresAt", "<", now)
      .get();

    if (!snap.empty) {
      const batch = db.batch();
      snap.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }
  }
);


// -------- USER --------






function assert(condition: any, code: HttpsError["code"], message: string): asserts condition {
  if (!condition) {
    throw new HttpsError(code, message);
  }
}



/** Get and validate trusted email */
async function getVerifiedEmail(uid: string): Promise<string> {
  try {
    const user = await getAuth().getUser(uid);
    const email = user.email;
    assert(email, "failed-precondition", "Auth user has no email");
    return email!;
  } catch {
    throw new HttpsError("not-found", "Auth user not found");
  }
}



/** Validate user exists and email matches */
async function verifyUserDoc(uid: string, expectedEmail: string) {
  const ref = db.collection("users").doc(uid);
  const snap = await ref.get();

  assert(snap.exists, "not-found", "User not found");

  const data = snap.data()!;
  assert(data.email === expectedEmail, "permission-denied", "Email mismatch");

  return { ref, data };
}



// ───────────────────────────────────────────
// checkIfUserExists
// ───────────────────────────────────────────
export const checkIfUserExists = onCall(async (req) => {
  const uid = req.data.uid;
  assert(typeof uid === "string", "invalid-argument", "Invalid uid");

  const doc = await db.collection("users").doc(uid).get();
  return { exists: doc.exists };
});



// ───────────────────────────────────────────
// addNewUser
// ───────────────────────────────────────────
export const addNewUser = onCall(async (req) => {
  const { uid, name, email: providedEmail, study } = req.data;

  assert(typeof uid === "string", "invalid-argument", "Invalid uid");
  assert(typeof name === "string", "invalid-argument", "Invalid name");

  const authEmail = await getVerifiedEmail(uid);

  // Prevent spoofing
  if (providedEmail && providedEmail !== authEmail) {
    throw new HttpsError("permission-denied", "Provided email does not match authentication email");
  }

  await db.collection("users").doc(uid).set(
    {
      uid,
      email: authEmail,
      username: name,
      study: study ?? null,
      score: 0,
      createdAt: Date.now(),
    },
    { merge: true }
  );

  return { success: true };
});



// ───────────────────────────────────────────
// updateScore
// ───────────────────────────────────────────
export const updateScore = onCall(async (req) => {
  const { uid, score } = req.data;

  assert(typeof uid === "string", "invalid-argument", "Invalid uid");
  assert(typeof score === "number" && score >= 0, "invalid-argument", "Invalid score");

  const authEmail = await getVerifiedEmail(uid);

  const userRef = db.collection("users").doc(uid);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef);
    assert(snap.exists, "not-found", "User not found");

    const data = snap.data()!;
    assert(data.email === authEmail, "permission-denied", "Email mismatch");

    if (score > (data.score ?? 0)) {
      tx.set(userRef, { score }, { merge: true });
    }
  });

  return { success: true, score };
});



// ───────────────────────────────────────────
// loadScore
// ───────────────────────────────────────────
export const loadScore = onCall(async (req) => {
  const uid = req.data.uid;
  assert(typeof uid === "string", "invalid-argument", "Invalid uid");

  const authEmail = await getVerifiedEmail(uid);
  const { data } = await verifyUserDoc(uid, authEmail);

  return { score: data.score ?? 0 };
});



// ───────────────────────────────────────────
// loadAllScores
// ───────────────────────────────────────────
export const loadAllScores = onCall(async (req) => {
  const limit = 20;
  const study = typeof req.data?.study === "string" ? req.data.study.trim() : null;

  const baseQuery = db.collection("users").orderBy("score", "desc").limit(limit);

  const allSnap = await baseQuery.get();
  const allScores = allSnap.docs.map((d) => {
    const x = d.data();
    return { name: x.username, score: x.score, study: x.study };
  });

  let studyScores: any[] = [];
  if (study) {
    const studySnap = await db
      .collection("users")
      .where("study", "==", study)
      .orderBy("score", "desc")
      .limit(limit)
      .get();

    studyScores = studySnap.docs.map((d) => {
      const x = d.data();
      return { name: x.username, score: x.score, study: x.study };
    });
  }

  return { success: true, allScores, studyScores };
});




// ----- TESTING -----





// ───────────────────────────────────────────
// seedUsers 
// ───────────────────────────────────────────
export const seedUsers = onCall(async () => {

const dummyUsers = [
    { uid: "dummy1", email: "dummy1@example.com", username: "Alice", score: 90, study: "cs" },
    { uid: "dummy2", email: "dummy2@example.com", username: "Bob", score: 85, study: "math" },
    { uid: "dummy3", email: "dummy3@example.com", username: "Charlie", score: 92, study: "science" },
    { uid: "dummy4", email: "dummy4@example.com", username: "Peggy", score: 100, study: "science" },
    { uid: "dummy5", email: "dummy5@example.com", username: "Daphne", score: 75, study: "math" },
];

  for (const user of dummyUsers) {
    await db.collection("users").doc(user.uid).set({
      ...user,
      createdAt: Date.now(),
    });
  }

  return { success: true, message: "Seeding complete!" };
});




// --- Add players to an existing lobby ---
export const addPlayersToLobby = onCall(async (req): Promise<Lobby> => {
  const { lobbyId, playerNames } = req.data;

  if (!lobbyId || !Array.isArray(playerNames) || playerNames.length === 0) {
    throw new HttpsError("invalid-argument", "Invalid lobbyId or playerNames");
  }

  const lobbyRef = db.collection("lobbies").doc(lobbyId);

  const updatedLobby = await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(lobbyRef);

    if (!doc.exists) {
      throw new HttpsError("not-found", "Lobby not found");
    }

    const lobby = doc.data() as Lobby;

    // Add new players
    const newPlayers = playerNames.map((name) => ({
      name,
      uid: generatePlayerUid(),
      isLeader: false,
    }));

    const allPlayers = [...lobby.players, ...newPlayers];

    transaction.update(lobbyRef, { players: allPlayers });

    return { ...lobby, players: allPlayers };
  });

  return updatedLobby;
});

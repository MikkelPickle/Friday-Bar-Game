import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
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
  avatarUrl?: string;
}

// --- The structure of a lobby in Firestore ---
interface Lobby {
  lobbyId: string;
  gamePin: number;
  createdAt: number;
  expiresAt: number;
  players: LobbyPlayer[];
  gameStatus?: "waiting" | "playing" | "finished";
}

// --- Challenge types ---
type Intensity = "mild" | "medium" | "spicy";
type ChallengeType = "general" | "player" | "versus" | "group";

interface Challenge {
  id: string;
  type: ChallengeType;
  template: string;
  templateDa: string;
  minPlayers: number;
  category: string;
  intensity: Intensity;
}

interface ResolvedChallenge {
  text: string;
  textDa: string;
  type: ChallengeType;
  category: string;
}

interface GameState {
  status: "playing" | "finished";
  currentChallengeIndex: number;
  challenges: ResolvedChallenge[];
  totalChallenges: number;
  intensity: Intensity;
  startedAt: number;
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
  const { creatorName, avatarUrl } = req.data;
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

  var lobby: Lobby = {
    lobbyId: lobbyRef.id,
    gamePin: gamePin,
    createdAt: createdAt.getTime(),
    expiresAt: expiresAt.getTime(), // 2 hours
    players: [{ name: creatorName, uid: playerUid, isLeader: true, avatarUrl: avatarUrl }],
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
  const { pin, playerName, avatarUrl } = req.data;

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
      { name: uniqueName, uid: playerUid, isLeader: false, avatarUrl: avatarUrl },
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
// Cleanup Expired Lobbies + Delete Images
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

    if (snap.empty) return;

    const storage = getStorage().bucket();

    const batch = db.batch();

    for (const doc of snap.docs) {
      const lobbyId = doc.id;

      // 1. Delete lobby document
      batch.delete(doc.ref);

      // 2. Delete all images inside lobbies/{lobbyId}/avatars/*
      const prefix = `lobbies/${lobbyId}/avatars/`;
      const [files] = await storage.getFiles({ prefix });

      if (files.length > 0) {
        for (const file of files) {
          await file.delete().catch(() => null); // ignore missing files
        }
      }
    }

    await batch.commit();
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



// ------ GAME ------




// Helper: Shuffle array (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Helper: Resolve template placeholders with player names
function resolveTemplate(template: string, players: LobbyPlayer[]): string {
  let result = template;

  // Replace {player}, {player1}, {player2}, {player3}
  const shuffled = shuffleArray(players);

  result = result.replace("{player}", shuffled[0]?.name || "Someone");
  result = result.replace("{player1}", shuffled[0]?.name || "Someone");
  result = result.replace("{player2}", shuffled[1]?.name || "Someone else");
  result = result.replace("{player3}", shuffled[2]?.name || "A third person");

  return result;
}


// ---------------------------------------------------------
// Start Game
// ---------------------------------------------------------
export const startGame = onCall(async (req): Promise<{ success: boolean }> => {
  const { lobbyId, playerUid, intensity } = req.data;

  assert(typeof lobbyId === "string", "invalid-argument", "Invalid lobbyId");
  assert(typeof playerUid === "string", "invalid-argument", "Invalid playerUid");
  assert(
    intensity === "mild" || intensity === "medium" || intensity === "spicy",
    "invalid-argument",
    "Invalid intensity"
  );

  const lobbyRef = db.collection("lobbies").doc(lobbyId);
  const lobbyDoc = await lobbyRef.get();

  if (!lobbyDoc.exists) {
    throw new HttpsError("not-found", "Lobby not found");
  }

  const lobby = lobbyDoc.data() as Lobby;

  // Verify caller is leader
  const leader = lobby.players.find((p) => p.isLeader);
  if (!leader || leader.uid !== playerUid) {
    throw new HttpsError("permission-denied", "Only the leader can start the game");
  }

  // Auto-seed challenges if collection is empty
  const existingChallenges = await db.collection("challenges").limit(1).get();
  if (existingChallenges.empty) {
    await seedChallengesInternal();
  }

  // Fetch challenges filtered by intensity
  const challengesSnap = await db
    .collection("challenges")
    .where("intensity", "==", intensity)
    .get();

  if (challengesSnap.empty) {
    throw new HttpsError("failed-precondition", "No challenges found for this intensity");
  }

  const challenges: Challenge[] = challengesSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Challenge[];

  // Filter challenges by minPlayers
  const playerCount = lobby.players.length;
  const validChallenges = challenges.filter((c) => c.minPlayers <= playerCount);

  if (validChallenges.length < 20) {
    throw new HttpsError(
      "failed-precondition",
      `Not enough challenges. Found ${validChallenges.length}, need 20.`
    );
  }

  // Shuffle and pick 20
  const shuffledChallenges = shuffleArray(validChallenges).slice(0, 20);

  // Resolve player names into templates
  const resolvedChallenges: ResolvedChallenge[] = shuffledChallenges.map((c) => ({
    text: resolveTemplate(c.template, lobby.players),
    textDa: resolveTemplate(c.templateDa, lobby.players),
    type: c.type,
    category: c.category,
  }));

  // Create game state
  const gameState: GameState = {
    status: "playing",
    currentChallengeIndex: 0,
    challenges: resolvedChallenges,
    totalChallenges: 20,
    intensity: intensity as Intensity,
    startedAt: Date.now(),
  };

  // Write game state and update lobby status
  const gameStateRef = lobbyRef.collection("gameState").doc("current");

  const batch = db.batch();
  batch.set(gameStateRef, gameState);
  batch.update(lobbyRef, { gameStatus: "playing" });
  await batch.commit();

  return { success: true };
});


// ---------------------------------------------------------
// Next Challenge
// ---------------------------------------------------------
export const nextChallenge = onCall(async (req): Promise<{ success: boolean; finished: boolean }> => {
  const { lobbyId, playerUid } = req.data;

  assert(typeof lobbyId === "string", "invalid-argument", "Invalid lobbyId");
  assert(typeof playerUid === "string", "invalid-argument", "Invalid playerUid");

  const lobbyRef = db.collection("lobbies").doc(lobbyId);
  const gameStateRef = lobbyRef.collection("gameState").doc("current");

  const result = await db.runTransaction(async (transaction) => {
    const lobbyDoc = await transaction.get(lobbyRef);
    const gameStateDoc = await transaction.get(gameStateRef);

    if (!lobbyDoc.exists) {
      throw new HttpsError("not-found", "Lobby not found");
    }

    if (!gameStateDoc.exists) {
      throw new HttpsError("not-found", "Game not started");
    }

    const lobby = lobbyDoc.data() as Lobby;
    const gameState = gameStateDoc.data() as GameState;

    // Verify caller is leader
    const leader = lobby.players.find((p) => p.isLeader);
    if (!leader || leader.uid !== playerUid) {
      throw new HttpsError("permission-denied", "Only the leader can advance the game");
    }

    if (gameState.status === "finished") {
      return { success: true, finished: true };
    }

    const nextIndex = gameState.currentChallengeIndex + 1;

    if (nextIndex >= gameState.totalChallenges) {
      // Game finished
      transaction.update(gameStateRef, {
        status: "finished",
        currentChallengeIndex: nextIndex,
      });
      transaction.update(lobbyRef, { gameStatus: "finished" });
      return { success: true, finished: true };
    }

    transaction.update(gameStateRef, { currentChallengeIndex: nextIndex });
    return { success: true, finished: false };
  });

  return result;
});


// ---------------------------------------------------------
// End Game
// ---------------------------------------------------------
export const endGame = onCall(async (req): Promise<{ success: boolean }> => {
  const { lobbyId, playerUid } = req.data;

  assert(typeof lobbyId === "string", "invalid-argument", "Invalid lobbyId");
  assert(typeof playerUid === "string", "invalid-argument", "Invalid playerUid");

  const lobbyRef = db.collection("lobbies").doc(lobbyId);
  const gameStateRef = lobbyRef.collection("gameState").doc("current");

  await db.runTransaction(async (transaction) => {
    const lobbyDoc = await transaction.get(lobbyRef);

    if (!lobbyDoc.exists) {
      throw new HttpsError("not-found", "Lobby not found");
    }

    const lobby = lobbyDoc.data() as Lobby;

    // Verify caller is leader
    const leader = lobby.players.find((p) => p.isLeader);
    if (!leader || leader.uid !== playerUid) {
      throw new HttpsError("permission-denied", "Only the leader can end the game");
    }

    transaction.update(gameStateRef, { status: "finished" });
    transaction.update(lobbyRef, { gameStatus: "finished" });
  });

  return { success: true };
});


// ---------------------------------------------------------
// Challenge Templates
// ---------------------------------------------------------
function getChallengeTemplates(): Omit<Challenge, "id">[] {
  return [
    // MILD - General
    {
      type: "general",
      template: "Everyone takes a sip!",
      templateDa: "Alle tager en tår!",
      minPlayers: 2,
      category: "drinking",
      intensity: "mild",
    },
    {
      type: "general",
      template: "Last person to touch their nose drinks!",
      templateDa: "Den sidste der rører sin næse drikker!",
      minPlayers: 2,
      category: "drinking",
      intensity: "mild",
    },
    {
      type: "general",
      template: "Youngest player drinks!",
      templateDa: "Den yngste spiller drikker!",
      minPlayers: 2,
      category: "drinking",
      intensity: "mild",
    },
    {
      type: "general",
      template: "Everyone with glasses drinks!",
      templateDa: "Alle med briller drikker!",
      minPlayers: 2,
      category: "drinking",
      intensity: "mild",
    },
    {
      type: "general",
      template: "Oldest player gives out 2 sips!",
      templateDa: "Den ældste spiller giver 2 tåre væk!",
      minPlayers: 2,
      category: "drinking",
      intensity: "mild",
    },
    {
      type: "general",
      template: "Everyone who has been abroad this year drinks!",
      templateDa: "Alle der har været i udlandet i år drikker!",
      minPlayers: 2,
      category: "drinking",
      intensity: "mild",
    },
    {
      type: "general",
      template: "Last person to raise their hand drinks!",
      templateDa: "Den sidste der løfter hånden drikker!",
      minPlayers: 2,
      category: "drinking",
      intensity: "mild",
    },
    // MILD - Player
    {
      type: "player",
      template: "{player} must compliment the person to their left!",
      templateDa: "{player} skal give personen til venstre et kompliment!",
      minPlayers: 2,
      category: "dare",
      intensity: "mild",
    },
    {
      type: "player",
      template: "{player} must do their best celebrity impression!",
      templateDa: "{player} skal lave deres bedste kendis-imitation!",
      minPlayers: 2,
      category: "dare",
      intensity: "mild",
    },
    {
      type: "player",
      template: "{player} picks someone to drink with them!",
      templateDa: "{player} vælger en person at drikke med!",
      minPlayers: 2,
      category: "drinking",
      intensity: "mild",
    },
    {
      type: "player",
      template: "{player} must speak in an accent until the next challenge!",
      templateDa: "{player} skal tale med accent indtil næste udfordring!",
      minPlayers: 2,
      category: "dare",
      intensity: "mild",
    },
    {
      type: "player",
      template: "{player} must tell a joke. If no one laughs, they drink!",
      templateDa: "{player} skal fortælle en joke. Hvis ingen griner, drikker de!",
      minPlayers: 2,
      category: "dare",
      intensity: "mild",
    },
    // MILD - Versus
    {
      type: "versus",
      template: "{player1} vs {player2}: Thumb war! Loser drinks.",
      templateDa: "{player1} mod {player2}: Tommelfinger-kamp! Taberen drikker.",
      minPlayers: 2,
      category: "drinking",
      intensity: "mild",
    },
    {
      type: "versus",
      template: "{player1} and {player2}: Staring contest. First to blink drinks!",
      templateDa: "{player1} og {player2}: Stirre-konkurrence. Den første der blinker drikker!",
      minPlayers: 2,
      category: "drinking",
      intensity: "mild",
    },
    // MILD - Group
    {
      type: "group",
      template: "{player1}, {player2}, and {player3} must cheers and drink together!",
      templateDa: "{player1}, {player2} og {player3} skal skåle og drikke sammen!",
      minPlayers: 3,
      category: "drinking",
      intensity: "mild",
    },

    // MEDIUM - General
    {
      type: "general",
      template: "Everyone who has been single for over a year drinks!",
      templateDa: "Alle der har været single i over et år drikker!",
      minPlayers: 2,
      category: "drinking",
      intensity: "medium",
    },
    {
      type: "general",
      template: "Waterfall! Leader starts, everyone follows!",
      templateDa: "Vandfald! Lederen starter, alle følger efter!",
      minPlayers: 3,
      category: "drinking",
      intensity: "medium",
    },
    {
      type: "general",
      template: "Everyone must reveal their screen time. Highest drinks!",
      templateDa: "Alle skal vise deres skærmtid. Højeste drikker!",
      minPlayers: 2,
      category: "truth",
      intensity: "medium",
    },
    {
      type: "general",
      template: "Never have I ever... been kicked out of a bar!",
      templateDa: "Jeg har aldrig... været smidt ud af en bar!",
      minPlayers: 2,
      category: "truth",
      intensity: "medium",
    },
    {
      type: "general",
      template: "Everyone takes 2 sips!",
      templateDa: "Alle tager 2 tåre!",
      minPlayers: 2,
      category: "drinking",
      intensity: "medium",
    },
    {
      type: "general",
      template: "Categories: Types of beer. First to hesitate drinks!",
      templateDa: "Kategorier: Typer øl. Den første der tøver drikker!",
      minPlayers: 2,
      category: "drinking",
      intensity: "medium",
    },
    {
      type: "general",
      template: "Rhyme time! Word: 'drink'. First to fail drinks!",
      templateDa: "Rim tid! Ord: 'øl'. Den første der fejler drikker!",
      minPlayers: 2,
      category: "drinking",
      intensity: "medium",
    },
    // MEDIUM - Player
    {
      type: "player",
      template: "{player} must reveal their most embarrassing photo on their phone!",
      templateDa: "{player} skal vise det mest pinlige billede på deres telefon!",
      minPlayers: 2,
      category: "embarrassing",
      intensity: "medium",
    },
    {
      type: "player",
      template: "{player} must do 10 push-ups or drink!",
      templateDa: "{player} skal lave 10 armbøjninger eller drikke!",
      minPlayers: 2,
      category: "dare",
      intensity: "medium",
    },
    {
      type: "player",
      template: "{player} must let someone send a text from their phone!",
      templateDa: "{player} skal lade nogen sende en besked fra deres telefon!",
      minPlayers: 2,
      category: "dare",
      intensity: "medium",
    },
    {
      type: "player",
      template: "{player} must say something nice about everyone!",
      templateDa: "{player} skal sige noget pænt om alle!",
      minPlayers: 2,
      category: "dare",
      intensity: "medium",
    },
    {
      type: "player",
      template: "{player} must do their best dance move!",
      templateDa: "{player} skal vise deres bedste dansetrin!",
      minPlayers: 2,
      category: "dare",
      intensity: "medium",
    },
    // MEDIUM - Versus
    {
      type: "versus",
      template: "{player1} vs {player2}: Rock paper scissors, best of 3. Loser drinks twice!",
      templateDa: "{player1} mod {player2}: Sten saks papir, bedst af 3. Taberen drikker to gange!",
      minPlayers: 2,
      category: "drinking",
      intensity: "medium",
    },
    {
      type: "versus",
      template: "{player1} and {player2}: Who can hold their breath longest? Loser drinks!",
      templateDa: "{player1} og {player2}: Hvem kan holde vejret længst? Taberen drikker!",
      minPlayers: 2,
      category: "drinking",
      intensity: "medium",
    },
    // MEDIUM - Group
    {
      type: "group",
      template: "{player1}, {player2}, and {player3} must finish their drinks!",
      templateDa: "{player1}, {player2} og {player3} skal tømme deres drinks!",
      minPlayers: 3,
      category: "drinking",
      intensity: "medium",
    },

    // SPICY - General
    {
      type: "general",
      template: "Everyone who has skinny-dipped drinks!",
      templateDa: "Alle der har badet nøgen drikker!",
      minPlayers: 2,
      category: "truth",
      intensity: "spicy",
    },
    {
      type: "general",
      template: "Never have I ever... had a one night stand!",
      templateDa: "Jeg har aldrig... haft et one night stand!",
      minPlayers: 2,
      category: "truth",
      intensity: "spicy",
    },
    {
      type: "general",
      template: "Everyone must confess their body count or drink 3 sips!",
      templateDa: "Alle skal afsløre deres body count eller drikke 3 tåre!",
      minPlayers: 2,
      category: "truth",
      intensity: "spicy",
    },
    {
      type: "general",
      template: "Everyone who has lied to get out of plans this week drinks!",
      templateDa: "Alle der har løjet for at slippe for planer i denne uge drikker!",
      minPlayers: 2,
      category: "truth",
      intensity: "spicy",
    },
    {
      type: "general",
      template: "Everyone takes 3 sips!",
      templateDa: "Alle tager 3 tåre!",
      minPlayers: 2,
      category: "drinking",
      intensity: "spicy",
    },
    {
      type: "general",
      template: "Never have I ever... sent a risky text to the wrong person!",
      templateDa: "Jeg har aldrig... sendt en risikabel besked til den forkerte person!",
      minPlayers: 2,
      category: "truth",
      intensity: "spicy",
    },
    {
      type: "general",
      template: "Hot seat: The group asks {player} 3 embarrassing questions!",
      templateDa: "Hot seat: Gruppen stiller {player} 3 pinlige spørgsmål!",
      minPlayers: 2,
      category: "truth",
      intensity: "spicy",
    },
    // SPICY - Player
    {
      type: "player",
      template: "{player} must reveal their last 3 Google searches!",
      templateDa: "{player} skal vise deres sidste 3 Google-søgninger!",
      minPlayers: 2,
      category: "embarrassing",
      intensity: "spicy",
    },
    {
      type: "player",
      template: "{player} must read their last sent DM out loud!",
      templateDa: "{player} skal læse deres seneste sendte DM højt!",
      minPlayers: 2,
      category: "embarrassing",
      intensity: "spicy",
    },
    {
      type: "player",
      template: "{player} must reveal their celebrity crush!",
      templateDa: "{player} skal afsløre deres kendis-crush!",
      minPlayers: 2,
      category: "truth",
      intensity: "spicy",
    },
    {
      type: "player",
      template: "{player} must say who in this room they'd date!",
      templateDa: "{player} skal sige hvem i rummet de ville date!",
      minPlayers: 2,
      category: "truth",
      intensity: "spicy",
    },
    {
      type: "player",
      template: "{player} must do their sexiest dance or drink 3 times!",
      templateDa: "{player} skal lave deres mest sexede dans eller drikke 3 gange!",
      minPlayers: 2,
      category: "dare",
      intensity: "spicy",
    },
    // SPICY - Versus
    {
      type: "versus",
      template: "{player1} vs {player2}: Who has the most embarrassing browser history? Group votes, loser drinks!",
      templateDa: "{player1} mod {player2}: Hvem har den mest pinlige browserhistorik? Gruppen stemmer, taberen drikker!",
      minPlayers: 2,
      category: "truth",
      intensity: "spicy",
    },
    {
      type: "versus",
      template: "{player1} and {player2}: Exchange phones for 30 seconds. First to grab it back drinks!",
      templateDa: "{player1} og {player2}: Byt telefoner i 30 sekunder. Den første der tager den tilbage drikker!",
      minPlayers: 2,
      category: "dare",
      intensity: "spicy",
    },
    // SPICY - Group
    {
      type: "group",
      template: "{player1}, {player2}, and {player3} must each share their worst date story!",
      templateDa: "{player1}, {player2} og {player3} skal hver dele deres værste date-historie!",
      minPlayers: 3,
      category: "truth",
      intensity: "spicy",
    },
  ];
}

// Internal function to seed challenges
async function seedChallengesInternal(): Promise<number> {
  const challenges = getChallengeTemplates();
  const batch = db.batch();

  for (const challenge of challenges) {
    const docRef = db.collection("challenges").doc();
    batch.set(docRef, { ...challenge, id: docRef.id });
  }

  await batch.commit();
  return challenges.length;
}

// ---------------------------------------------------------
// Seed Challenges (manual endpoint)
// ---------------------------------------------------------
export const seedChallenges = onCall(async (): Promise<{ success: boolean; count: number }> => {
  const count = await seedChallengesInternal();
  return { success: true, count };
});

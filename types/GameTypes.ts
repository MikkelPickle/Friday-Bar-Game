// Challenge intensity levels
export type Intensity = "mild" | "medium" | "spicy";

// Challenge types
export type ChallengeType = "general" | "player" | "versus" | "group";

// Challenge template stored in Firestore /challenges collection
export interface Challenge {
  id: string;
  type: ChallengeType;
  template: string;       // English: "Everyone takes a sip!" or "{player} must..."
  templateDa: string;     // Danish: "Alle tager en tår!" or "{player} skal..."
  minPlayers: number;
  category: string;       // "drinking", "dare", "truth", "embarrassing"
  intensity: Intensity;
}

// Resolved challenge with player names filled in
export interface ResolvedChallenge {
  text: string;           // English text with player names
  textDa: string;         // Danish text with player names
  type: ChallengeType;
  category: string;
}

// Game state stored at /lobbies/{lobbyId}/gameState/current
export interface GameState {
  status: "playing" | "finished";
  currentChallengeIndex: number;
  challenges: ResolvedChallenge[];
  totalChallenges: number;
  intensity: Intensity;
  startedAt: number;
}

// Request types for Cloud Functions
export interface StartGameRequest {
  lobbyId: string;
  playerUid: string;
  intensity: Intensity;
}

export interface NextChallengeRequest {
  lobbyId: string;
  playerUid: string;
}

export interface EndGameRequest {
  lobbyId: string;
  playerUid: string;
}

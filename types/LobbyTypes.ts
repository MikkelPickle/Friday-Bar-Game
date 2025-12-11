// --- Player object inside a lobby ---
export interface LobbyPlayer {
  name: string;
  uid: string;
  isLeader: boolean;
}

// --- The structure of a lobby in Firestore ---
export interface Lobby {
  gamePin: number;
  createdAt: number;
  expiresAt: number;
  players: LobbyPlayer[];
}

// --- Response from createLobby ---
export interface CreateLobbyResponse {
  gamePin: number;
  uid: string;
}

// --- Response from joinLobby ---
export interface JoinLobbyResponse {
  gamePin: number;
  players: LobbyPlayer[];
  uid: string;
}



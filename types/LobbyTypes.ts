// --- Player object inside a lobby ---
export interface LobbyPlayer {
  name: string;
  uid: string;
  isLeader: boolean;
}

// --- The structure of a lobby in Firestore ---
export interface Lobby {
  lobbyId: string;
  gamePin: number;
  createdAt: number;
  expiresAt: number;
  players: LobbyPlayer[];
}

// --- Response from createLobby ---
export interface CreateLobbyResponse {
  lobbyId: string;
  gamePin: number;
  uid: string;
}

// --- Response from joinLobby ---
export interface JoinLobbyResponse {
  lobbyId: string;
  gamePin: number;
  players: LobbyPlayer[];
  uid: string;
}



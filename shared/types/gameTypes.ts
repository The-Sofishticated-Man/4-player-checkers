export type BoardState = number[][]; // 2D array representing the board state
export type CurrentPlayer = 1 | 2 | 3 | 4; // Only 4 possible players

export type PlayerId = string;
export type SocketId = string;
export type RoomId = string;

export type playerMap = Map<PlayerId, PlayerState>;
export type SocketIdToPlayerIdMap = Map<SocketId, PlayerId>;
export interface PlayerState {
  isConnected: boolean;
  leftGame: boolean;
}
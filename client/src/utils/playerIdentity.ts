const PLAYER_ID_STORAGE_KEY = "playerId";

export const getOrCreatePlayerId = (): string => {
  const existingPlayerId = localStorage.getItem(PLAYER_ID_STORAGE_KEY);
  if (existingPlayerId) {
    return existingPlayerId;
  }

  const nextPlayerId = Math.random().toString(36).substring(2, 15);
  localStorage.setItem(PLAYER_ID_STORAGE_KEY, nextPlayerId);
  return nextPlayerId;
};

export const getDefaultNicknameForPlayerId = (playerId: string): string =>
  `P_${playerId}`;

export const resolveNickname = (
  nickname: string | null | undefined,
  playerId: string,
): string => {
  const trimmedNickname = nickname?.trim();
  if (trimmedNickname) {
    return trimmedNickname;
  }

  return getDefaultNicknameForPlayerId(playerId);
};

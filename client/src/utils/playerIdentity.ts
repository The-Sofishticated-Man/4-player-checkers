import { isNicknameWithinLimit } from "../../../shared/logic/nicknameValidation";

const PLAYER_ID_STORAGE_KEY = "playerId";
const PLAYER_NICKNAME_STORAGE_KEY = "playerNickname";

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

export const getStoredNickname = (): string | null => {
  const storedNickname = localStorage.getItem(PLAYER_NICKNAME_STORAGE_KEY);
  if (!storedNickname) {
    return null;
  }

  const trimmedNickname = storedNickname.trim();
  return trimmedNickname.length > 0 && isNicknameWithinLimit(trimmedNickname)
    ? trimmedNickname
    : null;
};

export const setStoredNickname = (nickname: string): void => {
  const trimmedNickname = nickname.trim();

  if (!isNicknameWithinLimit(trimmedNickname)) {
    return;
  }

  localStorage.setItem(PLAYER_NICKNAME_STORAGE_KEY, trimmedNickname);
};

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

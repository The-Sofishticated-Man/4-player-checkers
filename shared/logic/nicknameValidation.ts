export const MAX_NICKNAME_LENGTH = 15;

export const isNicknameWithinLimit = (nickname: string): boolean =>
  nickname.trim().length <= MAX_NICKNAME_LENGTH;

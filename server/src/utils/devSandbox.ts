const parseBooleanEnv = (value: string | undefined): boolean => {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
};

export const SANDBOX_MODE = parseBooleanEnv(process.env.CHECKERS_SANDBOX);

export const MIN_PLAYERS_TO_START = SANDBOX_MODE ? 1 : 4;

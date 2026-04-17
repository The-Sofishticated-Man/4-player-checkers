export const loadingSlots = [1, 2, 3, 4] as const;

export type PlayerSlot = (typeof loadingSlots)[number];

export type PlayerTheme = {
  name: string;
  surface: string;
  surfaceActive: string;
  border: string;
  accent: string;
  text: string;
  mutedText: string;
  glow: string;
  chipText: string;
};

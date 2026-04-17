import type { CSSProperties } from "react";
import type { PlayerSlot, PlayerTheme } from "../types/playerBoardTypes";

export const playerThemes: Record<PlayerSlot, PlayerTheme> = {
  1: {
    name: "Red",
    surface: "var(--player-1-surface)",
    surfaceActive: "var(--player-1-surface-strong)",
    border: "var(--player-1-border)",
    accent: "var(--player-1-accent)",
    text: "var(--player-1-text)",
    mutedText: "var(--player-1-muted)",
    glow: "rgba(190, 111, 120, 0.24)",
    chipText: "var(--player-1-text)",
  },
  2: {
    name: "Blue",
    surface: "var(--player-2-surface)",
    surfaceActive: "var(--player-2-surface-strong)",
    border: "var(--player-2-border)",
    accent: "var(--player-2-accent)",
    text: "var(--player-2-text)",
    mutedText: "var(--player-2-muted)",
    glow: "rgba(111, 151, 204, 0.24)",
    chipText: "var(--player-2-text)",
  },
  3: {
    name: "Green",
    surface: "var(--player-3-surface)",
    surfaceActive: "var(--player-3-surface-strong)",
    border: "var(--player-3-border)",
    accent: "var(--player-3-accent)",
    text: "var(--player-3-text)",
    mutedText: "var(--player-3-muted)",
    glow: "rgba(103, 172, 137, 0.24)",
    chipText: "var(--player-3-text)",
  },
  4: {
    name: "Yellow",
    surface: "var(--player-4-surface)",
    surfaceActive: "var(--player-4-surface-strong)",
    border: "var(--player-4-border)",
    accent: "var(--player-4-accent)",
    text: "var(--player-4-text)",
    mutedText: "var(--player-4-muted)",
    glow: "rgba(202, 162, 74, 0.24)",
    chipText: "var(--player-4-text)",
  },
};

export const panelTheme = {
  fontFamily:
    '"Avenir Next", "Nunito", "Segoe UI", "SF Pro Rounded", sans-serif',
  background: "rgba(255, 255, 255, 0.96)",
  borderColor: "var(--app-border)",
  color: "var(--app-text)",
  boxShadow: "var(--card-shadow)",
} as CSSProperties;

export function getPlayerTheme(playerNum: number): PlayerTheme {
  return playerThemes[playerNum as PlayerSlot] ?? playerThemes[1];
}

import type { CSSProperties } from "react";
import type { PlayerSlot, PlayerTheme } from "../types/sideMenuTypes";

export const playerThemes: Record<PlayerSlot, PlayerTheme> = {
  1: {
    name: "Red",
    pieceFill: "var(--player-1-color)",
    surface: "var(--player-1-surface)",
    surfaceActive: "var(--player-1-surface-strong)",
    border: "var(--player-1-border)",
    accent: "var(--player-1-color)",
    text: "var(--player-1-text)",
    mutedText: "var(--player-1-muted)",
  },
  2: {
    name: "Blue",
    pieceFill: "var(--player-2-color)",
    surface: "var(--player-2-surface)",
    surfaceActive: "var(--player-2-surface-strong)",
    border: "var(--player-2-border)",
    accent: "var(--player-2-color)",
    text: "var(--player-2-text)",
    mutedText: "var(--player-2-muted)",
  },
  3: {
    name: "Green",
    pieceFill: "var(--player-3-color)",
    surface: "var(--player-3-surface)",
    surfaceActive: "var(--player-3-surface-strong)",
    border: "var(--player-3-border)",
    accent: "var(--player-3-color)",
    text: "var(--player-3-text)",
    mutedText: "var(--player-3-muted)",
  },
  4: {
    name: "Yellow",
    pieceFill: "var(--player-4-color)",
    surface: "var(--player-4-surface)",
    surfaceActive: "var(--player-4-surface-strong)",
    border: "var(--player-4-border)",
    accent: "var(--player-4-color)",
    text: "var(--player-4-text)",
    mutedText: "var(--player-4-muted)",
  },
};

export const panelTheme = {
  fontFamily:
    '"Avenir Next", "Nunito", "Segoe UI", "SF Pro Rounded", sans-serif',
  background: "var(--menu-surface)",
  borderColor: "var(--menu-border)",
  color: "var(--menu-text)",
  boxShadow: "var(--menu-shadow)",
} as CSSProperties;

export function getPlayerTheme(playerNum: number): PlayerTheme {
  return playerThemes[playerNum as PlayerSlot] ?? playerThemes[1];
}

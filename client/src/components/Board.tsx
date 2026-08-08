import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useGameState from "../hooks/useBoard";
import type { PlayerSlot } from "../types/sideMenuTypes";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { generateBoardCells } from "../utils/boardRenderer";
import {
  getBoardRotationForPlayer,
  visualToLogicalPosition,
} from "../utils/boardOrientation";
import { isInMiddleGrid } from "../../../shared/logic/boardForfeit";
import { getPlayerFromPiece } from "../../../shared/logic/pieceUtils";
import { getPlayerTheme } from "../utils/sideMenuThemes";
import BoardGrid, { type BoardGridOverlay } from "./BoardGrid";
import PlayerCornerCard from "./PlayerCornerCard";
import PieceSvg from "./PieceSvg";
import movePieceSfx from "../sounds/move-piece.mp3";
import capturePieceSfx from "../sounds/capture-piece.mp3";
import playerDeathSfx from "../sounds/player-death.mp3";
import promotePieceSfx from "../sounds/promote-piece.wav";

const createSound = (src: string, volume: number) => {
  const audio = new Audio(src);
  audio.preload = "auto";
  audio.volume = volume;
  return audio;
};

const playSound = (audio: HTMLAudioElement | null, volumeScale = 1) => {
  if (!audio) return;

  const instance = audio.cloneNode(true) as HTMLAudioElement;
  instance.currentTime = 0;
  instance.volume = Math.max(0, Math.min(1, audio.volume * volumeScale));
  void instance.play().catch(() => {
    // Autoplay policies can block playback until user interaction.
  });
};

const boardStatesEqual = (left: number[][], right: number[][]): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  for (let row = 0; row < left.length; row++) {
    const leftRow = left[row];
    const rightRow = right[row];

    if (leftRow.length !== rightRow.length) {
      return false;
    }

    for (let col = 0; col < leftRow.length; col++) {
      if (leftRow[col] !== rightRow[col]) {
        return false;
      }
    }
  }

  return true;
};

const countPieces = (boardState: number[][]): number => {
  let total = 0;

  for (let row = 0; row < boardState.length; row++) {
    for (let col = 0; col < boardState[row].length; col++) {
      if (boardState[row][col] > 0) {
        total += 1;
      }
    }
  }

  return total;
};

const hasPromotion = (
  previousBoard: number[][],
  nextBoard: number[][],
): boolean => {
  const kingCountsBefore = new Map<number, number>();
  const kingCountsAfter = new Map<number, number>();

  for (let row = 0; row < previousBoard.length; row++) {
    for (let col = 0; col < previousBoard[row].length; col++) {
      const previousPiece = previousBoard[row][col];
      const nextPiece = nextBoard[row][col];

      if (previousPiece >= 10) {
        const owner = Math.floor(previousPiece / 10);
        kingCountsBefore.set(owner, (kingCountsBefore.get(owner) ?? 0) + 1);
      }

      if (nextPiece >= 10) {
        const owner = Math.floor(nextPiece / 10);
        kingCountsAfter.set(owner, (kingCountsAfter.get(owner) ?? 0) + 1);
      }
    }
  }

  const owners = new Set<number>([
    ...kingCountsBefore.keys(),
    ...kingCountsAfter.keys(),
  ]);

  for (const owner of owners) {
    if (
      (kingCountsAfter.get(owner) ?? 0) > (kingCountsBefore.get(owner) ?? 0)
    ) {
      return true;
    }
  }

  return false;
};

interface BoardProps {
  allowMoveAnyPiece?: boolean;
}

const Board = ({ allowMoveAnyPiece = false }: BoardProps) => {
  const {
    gameState: {
      boardState,
      currentPlayer,
      gameStarted,
      gameOver,
      players,
      activePlayers,
      clock,
    },
    dispatchGameState: dispatch,
    playerIndex,
  } = useGameState();
  const [clockNowMs, setClockNowMs] = useState(() => Date.now());
  const [deathAnimationTargets, setDeathAnimationTargets] = useState(
    () => new Set<string>(),
  );
  const moveSoundRef = useRef<HTMLAudioElement | null>(null);
  const captureSoundRef = useRef<HTMLAudioElement | null>(null);
  const deathSoundRef = useRef<HTMLAudioElement | null>(null);
  const promoteSoundRef = useRef<HTMLAudioElement | null>(null);
  const previousBoardStateForDeathRef = useRef(boardState);
  const previousActivePlayersRef = useRef(activePlayers ?? [1, 2, 3, 4]);
  const previousBoardStateForSoundRef = useRef(boardState);
  const hasSoundBaselineRef = useRef(false);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setClockNowMs(Date.now());
    }, 200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    moveSoundRef.current = createSound(movePieceSfx, 0.4);
    captureSoundRef.current = createSound(capturePieceSfx, 0.55);
    deathSoundRef.current = createSound(playerDeathSfx, 0.2);
    promoteSoundRef.current = createSound(promotePieceSfx, 0.5);

    return () => {
      moveSoundRef.current = null;
      captureSoundRef.current = null;
      deathSoundRef.current = null;
      promoteSoundRef.current = null;
    };
  }, []);

  useEffect(() => {
    const previousBoardState = previousBoardStateForSoundRef.current;

    if (!hasSoundBaselineRef.current) {
      hasSoundBaselineRef.current = true;
      previousBoardStateForSoundRef.current = boardState;
      return;
    }

    if (boardStatesEqual(previousBoardState, boardState)) {
      previousBoardStateForSoundRef.current = boardState;
      return;
    }

    const moveWasPromotion = hasPromotion(previousBoardState, boardState);

    if (moveWasPromotion) {
      playSound(promoteSoundRef.current);
      previousBoardStateForSoundRef.current = boardState;
      return;
    }

    const previousPieceCount = countPieces(previousBoardState);
    const nextPieceCount = countPieces(boardState);
    const moveWasCapture = nextPieceCount < previousPieceCount;

    if (moveWasCapture) {
      playSound(captureSoundRef.current);
    } else {
      playSound(moveSoundRef.current);
    }

    previousBoardStateForSoundRef.current = boardState;
  }, [boardState]);

  useEffect(() => {
    const previousBoardState = previousBoardStateForDeathRef.current;
    const previousActivePlayers = previousActivePlayersRef.current;
    const nextActivePlayers = activePlayers ?? previousActivePlayers;

    previousBoardStateForDeathRef.current = boardState;
    previousActivePlayersRef.current = nextActivePlayers;

    const eliminatedPlayers = previousActivePlayers.filter(
      (player) => !nextActivePlayers.includes(player),
    );

    if (eliminatedPlayers.length === 0) {
      return;
    }

    playSound(deathSoundRef.current, 0.35);

    const nextTargets = new Set<string>();

    for (const eliminatedPlayer of eliminatedPlayers) {
      for (let row = 0; row < previousBoardState.length; row++) {
        for (let col = 0; col < previousBoardState[row].length; col++) {
          const piece = previousBoardState[row][col];

          if (
            piece <= 0 ||
            getPlayerFromPiece(piece) !== eliminatedPlayer ||
            isInMiddleGrid(row, col)
          ) {
            continue;
          }

          nextTargets.add(`${row},${col}`);
        }
      }
    }

    if (nextTargets.size === 0) {
      return;
    }

    setDeathAnimationTargets(nextTargets);

    const timeoutId = window.setTimeout(() => {
      setDeathAnimationTargets(new Set());
    }, 600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activePlayers, boardState]);

  const {
    validMoves,
    draggedPieceOwner,
    activePiece,
    selectedPiece,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    handlePieceClick,
    handleCellClick,
  } = useDragAndDrop(
    boardState,
    dispatch,
    allowMoveAnyPiece,
    currentPlayer,
    playerIndex,
    gameStarted,
  );

  // Keep click-to-select separate from drag by requiring small pointer movement.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const renderOverlayPiece = () => {
    if (!activePiece || activePiece < 0) {
      return null;
    }

    const kingPiece = activePiece >= 10;
    const owner = kingPiece ? Math.floor(activePiece / 10) : activePiece;

    return (
      <PieceSvg
        playerNumber={owner}
        isKing={kingPiece}
        className="h-[3.3rem] w-[3.3rem]"
      />
    );
  };

  const boardSize = boardState.length;
  const lastIndex = boardSize - 1;
  const boardRotation = getBoardRotationForPlayer(playerIndex);

  const logicalCornerSlotLookup = useMemo(
    () =>
      new Map<string, PlayerSlot>([
        ["0,0", 3],
        [`0,${lastIndex}`, 4],
        [`${lastIndex},0`, 2],
        [`${lastIndex},${lastIndex}`, 1],
      ]),
    [lastIndex],
  );

  const formatClock = useCallback((remainingMs: number): string => {
    const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");

    return `${minutes}:${seconds}`;
  }, []);

  const getDisplayRemainingMs = useCallback(
    (slotNumber: PlayerSlot): number => {
      const baseRemainingMs = clock.remainingMs[slotNumber] ?? 0;

      if (
        clock.paused ||
        clock.runningPlayer !== slotNumber ||
        clock.lastUpdatedAtMs === null ||
        gameOver
      ) {
        return baseRemainingMs;
      }

      const elapsedMs = Math.max(0, clockNowMs - clock.lastUpdatedAtMs);
      return Math.max(0, baseRemainingMs - elapsedMs);
    },
    [clock, clockNowMs, gameOver],
  );

  const playerEntries = useMemo(() => Array.from(players.entries()), [players]);

  const cornerOverlays = useMemo((): BoardGridOverlay[] => {
    const livePlayers = activePlayers ?? [1, 2, 3, 4];
    const visualCornerRegions = [
      {
        corner: "top-left" as const,
        visualRow: 0,
        visualCol: 0,
        rowStart: 1,
        colStart: 1,
        className: "h-full w-full",
      },
      {
        corner: "top-right" as const,
        visualRow: 0,
        visualCol: lastIndex,
        rowStart: 1,
        colStart: boardSize - 2,
        className: "h-full w-full",
      },
      {
        corner: "bottom-left" as const,
        visualRow: lastIndex,
        visualCol: 0,
        rowStart: boardSize - 2,
        colStart: 1,
        className: "h-full w-full",
      },
      {
        corner: "bottom-right" as const,
        visualRow: lastIndex,
        visualCol: lastIndex,
        rowStart: boardSize - 2,
        colStart: boardSize - 2,
        className: "h-full w-full",
      },
    ];

    const overlays: BoardGridOverlay[] = [];

    for (const region of visualCornerRegions) {
      const logicalCorner = visualToLogicalPosition(
        region.visualRow,
        region.visualCol,
        boardSize,
        boardRotation,
      );
      const slot = logicalCornerSlotLookup.get(
        `${logicalCorner.row},${logicalCorner.col}`,
      );

      if (!slot) {
        continue;
      }

      const theme = getPlayerTheme(slot);
      const playerEntry = playerEntries[slot - 1];
      const playerId = playerEntry?.[0];
      const nickname = playerEntry?.[1].nickname;
      const isConnected = Boolean(playerEntry?.[1].isConnected);
      const hasLeftGame = Boolean(playerEntry?.[1].leftGame);
      const isDefeated = Boolean(playerId) && !livePlayers.includes(slot);
      const remainingMs = getDisplayRemainingMs(slot);

      overlays.push({
        key: `corner-${region.corner}-${slot}`,
        rowStart: region.rowStart,
        colStart: region.colStart,
        rowSpan: 3,
        colSpan: 3,
        className: region.className,
        content: (
          <PlayerCornerCard
            slotNumber={slot}
            theme={theme}
            timerEdge={
              region.corner === "top-left" || region.corner === "top-right"
                ? "bottom"
                : "top"
            }
            isCurrentTurn={currentPlayer === slot}
            isYou={playerIndex === slot}
            playerId={playerId}
            nickname={nickname}
            isConnected={isConnected}
            hasLeftGame={hasLeftGame}
            isDefeated={isDefeated}
            clockLabel={formatClock(remainingMs)}
          />
        ),
      });
    }

    return overlays;
  }, [
    activePlayers,
    boardRotation,
    boardSize,
    formatClock,
    getDisplayRemainingMs,
    logicalCornerSlotLookup,
    lastIndex,
    currentPlayer,
    playerEntries,
    playerIndex,
  ]);

  const cells = generateBoardCells(
    boardState,
    validMoves,
    draggedPieceOwner,
    currentPlayer,
    playerIndex,
    (gameStarted || false) && !gameOver,
    allowMoveAnyPiece,
    selectedPiece,
    deathAnimationTargets,
    handlePieceClick,
    handleCellClick,
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <BoardGrid
        cells={cells}
        boardSize={boardSize}
        overlays={cornerOverlays}
      />
      <DragOverlay dropAnimation={null}>{renderOverlayPiece()}</DragOverlay>
    </DndContext>
  );
};

export default Board;

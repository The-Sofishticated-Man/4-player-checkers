import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import useGameState from "../hooks/useBoard";
import type { PlayerSlot } from "../types/sideMenuTypes";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { generateBoardCells } from "../utils/boardRenderer";
import {
  getBoardRotationForPlayer,
  visualToLogicalPosition,
} from "../utils/boardOrientation";
import { getPlayerTheme } from "../utils/sideMenuThemes";
import BoardGrid, { type BoardGridOverlay } from "./BoardGrid";
import PlayerCornerCard from "./PlayerCornerCard";
import PieceSvg from "./PieceSvg";

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

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setClockNowMs(Date.now());
    }, 200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

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

import Board from "./Board";
import { useJoinGame } from "../hooks/useJoinGame";
import SideMenu from "./SideMenu";
import SideMenuSkeleton from "./SideMenuSkeleton";
import DevSandboxPanel from "./DevSandboxPanel";

function BoardSession({
  roomId,
  allowMoveAnyPiece,
  onToggleMoveAnyPiece,
  nickname,
}: {
  roomId: string;
  allowMoveAnyPiece: boolean;
  onToggleMoveAnyPiece: React.Dispatch<React.SetStateAction<boolean>>;
  nickname: string;
}) {
  const { isConnecting, error } = useJoinGame(roomId, nickname);

  if (isConnecting) {
    return (
      <>
        <SideMenuSkeleton />
        <div
          className="min-h-screen flex items-center justify-center p-4"
          style={{ background: "var(--page-bg)" }}
        >
          <div
            className="rounded-xl border px-5 py-3 shadow-sm text-sm font-medium"
            style={{
              background: "var(--app-surface-strong)",
              borderColor: "var(--app-border)",
              color: "var(--app-muted)",
            }}
          >
            Syncing game state...
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "var(--page-bg)" }}
      >
        <div
          className="rounded-xl border px-5 py-3 shadow-sm text-sm font-medium"
          style={{
            background: "var(--app-error-surface)",
            borderColor: "var(--app-error-border)",
            color: "var(--app-error-text)",
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at top left, var(--game-bg-accent), transparent 40%), radial-gradient(circle at bottom right, var(--game-bg-warmth), transparent 34%), var(--game-bg)",
      }}
    >
      <SideMenu />
      <Board allowMoveAnyPiece={allowMoveAnyPiece} />
      <DevSandboxPanel
        roomId={roomId}
        allowMoveAnyPiece={allowMoveAnyPiece}
        onToggleMoveAnyPiece={onToggleMoveAnyPiece}
      />
    </div>
  );
}

export default BoardSession;

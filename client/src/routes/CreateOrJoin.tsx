import { useState } from "react";
import { useCreateGame } from "../hooks/useCreateGame";
import ConnectionFlag from "../components/ConnectionFlag";
import PageDecorations from "../components/PageDecorations";
import GameLogo from "../components/GameLogo";
import Footer from "../components/Footer.tsx"
import { FiLoader, FiZap, FiUsers } from "react-icons/fi";

function CreateOrJoin() {
  const [isCreating, setIsCreating] = useState(false);
  const [isQuickPlaying, setIsQuickPlaying] = useState(false);
  const { createGame, quickPlay } = useCreateGame();

  const handleCreateGame = async () => {
    setIsCreating(true);
    createGame(() => {
      setIsCreating(false);
    });
  };

  const handleQuickPlay = async () => {
    setIsQuickPlaying(true);
    quickPlay(() => {
      setIsQuickPlaying(false);
    });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "var(--page-bg)" }}
    >
      <PageDecorations />
      <ConnectionFlag />

      <div className="w-full max-w-md relative" style={{ zIndex: 1 }}>
        {/* Header */}
        <div className="text-center mb-8">
          <GameLogo />
          <h1
            className="mb-2"
            style={{
              color: "var(--app-text)",
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 800,
              fontSize: "2.4rem",
              letterSpacing: "0.01em",
            }}
          >
            lecheeeeckers
          </h1>
          <p style={{ color: "var(--app-muted)" }}>
            4 player checkers because why the hell not
          </p>
        </div>

        {/* Main Card */}
        <div
          className="rounded-2xl p-8 shadow-xl backdrop-blur-sm"
          style={{
            background: "var(--app-surface-strong)",
            border: "1px solid var(--app-border)",
          }}
        >
          <div className="space-y-3">
            <h2
              className="flex items-center text-lg font-semibold"
              style={{ color: "var(--app-text)" }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full mr-3"
                style={{ background: "var(--logo-green)" }}
              />
              Start a new game
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={handleQuickPlay}
                disabled={isCreating || isQuickPlaying}
                className="group w-full rounded-xl border px-4 py-4 text-left font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  background: "var(--player-1-color)",
                  borderColor: "rgba(255,255,255,0.12)",
                  boxShadow: "0 12px 30px rgba(0, 0, 0, 0.18)",
                }}
              >
                <div className="flex items-center gap-3">
                  {isQuickPlaying ? (
                    <FiLoader className="h-5 w-5 shrink-0 animate-spin" />
                  ) : (
                    <FiZap className="h-5 w-5 shrink-0" />
                  )}
                  <div>
                    <div className="text-base">Quick Play</div>
                    <div className="text-xs font-medium opacity-80">
                      Jump into matchmaking
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={handleCreateGame}
                disabled={isCreating || isQuickPlaying}
                className="group w-full rounded-xl border px-4 py-4 text-left font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  background: "var(--player-3-color)",
                  borderColor: "rgba(255,255,255,0.12)",
                  boxShadow: "0 12px 30px rgba(0, 0, 0, 0.18)",
                }}
              >
                <div className="flex items-center gap-3">
                  {isCreating ? (
                    <FiLoader className="h-5 w-5 shrink-0 animate-spin" />
                  ) : (
                    <FiUsers className="h-5 w-5 shrink-0" />
                  )}
                  <div>
                    <div className="text-base">Play With Friends</div>
                    <div className="text-xs font-medium opacity-80">
                      Create a private room link
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default CreateOrJoin;

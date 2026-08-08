import { useState } from "react";
import { useCreateGame } from "../hooks/useCreateGame";
import ConnectionFlag from "../components/ConnectionFlag";
import PageDecorations from "../components/PageDecorations";
import GameLogo from "../components/GameLogo";

function CreateOrJoin() {
  const [isCreating, setIsCreating] = useState(false);
  const { createGame } = useCreateGame();

  const handleCreateGame = async () => {
    setIsCreating(true);
    createGame(() => {
      setIsCreating(false);
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
            4-Player Checkers
          </h1>
          <p style={{ color: "var(--app-muted)" }}>
            Create a game and share your room code
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
            <button
              onClick={handleCreateGame}
              disabled={isCreating}
              className="w-full text-white py-4 px-4 rounded-xl font-semibold text-lg
                       focus:outline-none focus:ring-4
                       transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                       shadow-lg hover:shadow-xl"
              style={{
                background:
                  "var(--player-3-color)",
                boxShadow: "0 10px 30px var(--player-3-color)",
              }}
            >
              {isCreating ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating Game...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Create Game
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateOrJoin;

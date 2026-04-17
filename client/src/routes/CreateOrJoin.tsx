import { useState } from "react";
import { useCreateGame } from "../hooks/useCreateGame";

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
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--page-bg)" }}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{
              background:
                "linear-gradient(135deg, var(--player-2-accent), var(--player-1-accent))",
            }}
          >
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7v10c0 5.55 3.84 9.95 9 11 5.16-1.05 9-5.45 9-11V7l-10-5z" />
            </svg>
          </div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--app-text)" }}
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
          <div className="space-y-6">
            {/* Create Game Section */}
            <div className="space-y-3">
              <h2
                className="flex items-center text-lg font-semibold"
                style={{ color: "var(--app-text)" }}
              >
                <div
                  className="w-2 h-2 rounded-full mr-3"
                  style={{ background: "var(--player-2-accent)" }}
                ></div>
                Start New Game
              </h2>
              <button
                onClick={handleCreateGame}
                disabled={isCreating}
                className="w-full text-white py-3 px-4 rounded-xl font-medium
                         focus:outline-none focus:ring-4
                         transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                         shadow-lg hover:shadow-xl"
                style={{
                  background:
                    "linear-gradient(135deg, var(--player-2-accent), var(--player-2-border))",
                  boxShadow: "0 18px 30px rgba(111, 151, 204, 0.24)",
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
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
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Create Game
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div
            className="mt-8 pt-6"
            style={{ borderTop: "1px solid var(--app-border)" }}
          >
            <div
              className="flex items-center justify-center text-sm"
              style={{ color: "var(--app-muted)" }}
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Games support up to 4 players
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateOrJoin;

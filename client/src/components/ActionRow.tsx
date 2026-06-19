import { FiUserX } from "react-icons/fi";

type ActionRowProps = {
  playerIndex: number;
  gameOver: boolean;
  isForfeiting: boolean;
  isYouForfeited: boolean;
  onForfeit: () => void;
  onExit: () => void;
};

function ActionRow({
  playerIndex,
  gameOver,
  isForfeiting,
  isYouForfeited,
  onForfeit,
  onExit,
}: ActionRowProps) {
  return (
    <div className="mt-3 flex items-center justify-end gap-2">
      {playerIndex > 0 && !gameOver && (
        <button
          type="button"
          onClick={onForfeit}
          disabled={isForfeiting || isYouForfeited}
          className="rounded-full border border-slate-300 bg-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-md shadow-slate-300/60 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="inline-flex items-center gap-1.5">
            <FiUserX className="h-3.5 w-3.5" />
            <span>
              {isYouForfeited
                ? "FORFEITED"
                : isForfeiting
                  ? "LEAVING..."
                  : "FORFEIT"}
            </span>
          </span>
        </button>
      )}

      {playerIndex > 0 && gameOver && (
        <button
          type="button"
          onClick={onExit}
          className="rounded-full border border-slate-300 bg-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-md shadow-slate-300/60 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-slate-300"
        >
          EXIT
        </button>
      )}
    </div>
  );
}

export default ActionRow;

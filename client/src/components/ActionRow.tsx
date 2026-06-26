import { FiLogOut } from "react-icons/fi";

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
    <div className="mt-4 flex w-full">
      {playerIndex > 0 && !gameOver && (
        <button
          type="button"
          onClick={onForfeit}
          disabled={isForfeiting || isYouForfeited}
          className="w-full border border-slate-600 bg-[#2a2a2a] px-4 py-3 text-xs font-bold font-mono tracking-widest text-[#eee] transition-colors duration-200 hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-50 text-left"
        >
          <span className="inline-flex items-center gap-2">
            <FiLogOut className="h-4 w-4" />
            <span>
              {isYouForfeited
                ? "FORFEITED"
                : isForfeiting
                  ? "LEAVING..."
                  : "LEAVE GAME"}
            </span>
          </span>
        </button>
      )}

      {playerIndex > 0 && gameOver && (
        <button
          type="button"
          onClick={onExit}
          className="w-full border border-slate-600 bg-[#2a2a2a] px-4 py-3 text-xs font-bold font-mono tracking-widest text-[#eee] transition-colors duration-200 hover:bg-[#333] text-left"
        >
          <span className="inline-flex items-center gap-2">
            <FiLogOut className="h-4 w-4" />
            <span>EXIT GAME</span>
          </span>
        </button>
      )}
    </div>
  );
}

export default ActionRow;

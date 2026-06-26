import { FiCopy } from "react-icons/fi";

type RoomLinkFieldProps = {
  roomLink: string;
  linkCopied: boolean;
  onCopy: () => void;
};

function RoomLinkField({ roomLink, linkCopied, onCopy }: RoomLinkFieldProps) {
  if (!roomLink) {
    return null;
  }

  return (
    <div className="border border-slate-700 bg-[#222]">
      <div className="border-b border-slate-700 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#aaa] font-mono">
        Invite Link
      </div>
      <div className="p-3">
        <div className="flex border border-slate-600 rounded bg-transparent">
          <input
            type="text"
            readOnly
            value={roomLink}
            aria-label="Room link"
            className="flex-1 bg-transparent px-3 py-2 font-mono text-xs text-[#eee] outline-none"
            onFocus={(event) => event.currentTarget.select()}
          />
          <button
            type="button"
            onClick={onCopy}
            className="px-4 border-l border-slate-600 bg-[#2a2a2a] text-xs font-bold text-[#eee] hover:bg-[#333] transition-colors font-mono"
            title={linkCopied ? "Copied" : "Copy room link"}
          >
            {linkCopied ? "COPIED!" : "COPY"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoomLinkField;

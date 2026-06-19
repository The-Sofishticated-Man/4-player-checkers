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
    <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        Room Link
      </div>
      <div className="relative">
        <input
          type="text"
          readOnly
          value={roomLink}
          aria-label="Room link"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-3 pr-11 font-mono text-[11px] text-slate-700 outline-none"
          onFocus={(event) => event.currentTarget.select()}
        />
        <button
          type="button"
          onClick={onCopy}
          className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center rounded-r-xl border-l border-slate-200 bg-slate-100 text-slate-600 transition-transform duration-200 hover:bg-slate-200"
          aria-label={linkCopied ? "Copied room link" : "Copy room link"}
          title={linkCopied ? "Copied" : "Copy room link"}
        >
          <FiCopy className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default RoomLinkField;

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
    <div
      className="border"
      style={{
        background: "var(--menu-surface-strong)",
        borderColor: "var(--menu-border)",
      }}
    >
      <div
        className="border-b px-3 py-2 text-[10px] font-bold uppercase tracking-widest font-mono"
        style={{
          color: "var(--menu-muted)",
          borderColor: "var(--menu-border)",
        }}
      >
        Invite Link
      </div>
      <div className="p-3">
        <div
          className="flex rounded border"
          style={{ borderColor: "var(--menu-border)" }}
        >
          <input
            type="text"
            readOnly
            value={roomLink}
            aria-label="Room link"
            className="flex-1 bg-transparent px-3 py-2 font-mono text-xs outline-none"
            style={{ color: "var(--menu-heading)" }}
            onFocus={(event) => event.currentTarget.select()}
          />
          <button
            type="button"
            onClick={onCopy}
            className="border-l px-4 text-xs font-bold transition-colors font-mono"
            style={{
              background: "var(--menu-header)",
              borderColor: "var(--menu-border)",
              color: "var(--menu-heading)",
            }}
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

// Drop this in src/components/GameLogo.jsx
export default function GameLogo() {
  const cells = ["var(--logo-blue)", "var(--logo-red)", "var(--logo-green)", "var(--logo-yellow)"];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 10,
        width: 78,
        height: 78,
        margin: "0 auto 20px",
      }}
    >
      {cells.map((c, i) => (
        <div
          key={i}
          style={{
            borderRadius: "50%",
            background: c,
            boxShadow:
              "inset -3px -4px 6px rgba(0,0,0,0.15), inset 2px 3px 4px rgba(255,255,255,0.35)",
          }}
        />
      ))}
    </div>
  );
}

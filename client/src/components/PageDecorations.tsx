// Drop this in src/components/PageDecorations.tsx
// Renders the 4 corner blobs + scattered dots/scribbles/x-marks/rings
// seen behind the card. Purely decorative, aria-hidden.

import type { CSSProperties } from "react";

interface DotProps {
  style?: CSSProperties;
  color?: string;
  size?: number;
}

function Dot({ style, color = "#9CA3AF", size = 5 }: DotProps) {
  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        ...style,
      }}
    />
  );
}

interface RingCircleProps {
  style?: CSSProperties;
  color: string;
  size?: number;
  strokeWidth?: number;
}

function RingCircle({ style, color, size = 24, strokeWidth = 2 }: RingCircleProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      style={{ position: "absolute", width: size, height: size, ...style }}
    >
      <circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth={strokeWidth} />
    </svg>
  );
}

interface XMarkProps {
  style?: CSSProperties;
  color: string;
  size?: number;
}

function XMark({ style, color, size = 18 }: XMarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      style={{ position: "absolute", width: size, height: size, ...style }}
    >
      <path d="M5 5l14 14M19 5L5 19" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

interface ScribbleProps {
  style?: CSSProperties;
  color: string;
  w?: number;
  h?: number;
  dashed?: boolean;
}

function Scribble({ style, color, w = 130, h = 40, dashed = false }: ScribbleProps) {
  return (
    <svg
      viewBox="0 0 130 40"
      style={{ position: "absolute", width: w, height: h, ...style }}
    >
      <path
        d="M2 30 C 20 5, 40 38, 60 15 S 100 5, 128 25"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={dashed ? "5 6" : "0"}
        opacity="0.7"
      />
    </svg>
  );
}

interface DotGridProps {
  style?: CSSProperties;
  color: string;
}

function DotGrid({ style, color }: DotGridProps) {
  const cells = Array.from({ length: 16 });
  return (
    <div
      style={{
        position: "absolute",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "10px",
        ...style,
      }}
    >
      {cells.map((_, i) => (
        <div
          key={i}
          style={{ width: 4, height: 4, borderRadius: "50%", background: color, opacity: 0.55 }}
        />
      ))}
    </div>
  );
}

type Corner = "tl" | "tr" | "bl" | "br";

interface CornerBlobProps {
  corner: Corner;
  colors: string[];
}

function CornerBlob({ corner, colors }: CornerBlobProps) {
  const base: CSSProperties = {
    position: "absolute",
    width: "26vw",
    height: "26vw",
    minWidth: 260,
    minHeight: 260,
    maxWidth: 420,
    maxHeight: 420,
  };
  const shapes: Record<Corner, CSSProperties> = {
    tl: {
      top: "-8%",
      left: "-8%",
      background: colors[0],
      borderRadius: "0% 62% 45% 100% / 0% 55% 55% 100%",
      transform: "rotate(-6deg)",
    },
    tr: {
      top: "-10%",
      right: "-8%",
      background: colors[0],
      borderRadius: "62% 0% 100% 45% / 55% 0% 100% 55%",
      transform: "rotate(6deg)",
    },
    bl: {
      bottom: "-12%",
      left: "-10%",
      background: colors[0],
      borderRadius: "0% 100% 55% 62% / 0% 100% 45% 60%",
      transform: "rotate(4deg)",
    },
    br: {
      bottom: "-10%",
      right: "-9%",
      background: colors[0],
      borderRadius: "100% 0% 62% 55% / 100% 0% 60% 45%",
      transform: "rotate(-5deg)",
    },
  };
  return (
    <div style={{ ...base, ...shapes[corner], overflow: "hidden" }}>
      {colors[1] && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: colors[1],
            mixBlendMode: "multiply",
            opacity: 0.18,
            backgroundImage:
              "radial-gradient(circle at 30% 30%, transparent 40%, rgba(0,0,0,0.12) 100%)",
          }}
        />
      )}
    </div>
  );
}

export default function PageDecorations() {
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
      <CornerBlob corner="tl" colors={["var(--corner-blue)"]} />
      <CornerBlob corner="tr" colors={["var(--corner-orange)"]} />
      <CornerBlob corner="bl" colors={["var(--corner-red)", "var(--corner-red-dark)"]} />
      <CornerBlob corner="br" colors={["var(--corner-green)", "var(--corner-green-dark)"]} />

      <Scribble color="var(--corner-blue)" style={{ top: "6%", left: "12%" }} w={130} h={40} />
      <RingCircle color="var(--corner-blue)" size={22} style={{ top: "15%", left: "13%" }} />
      <Dot color="#B9B9B9" style={{ top: "5%", left: "30%" }} size={5} />
      <Dot color="#B9B9B9" style={{ top: "6%", right: "22%" }} size={5} />

      <RingCircle color="var(--corner-orange)" size={18} style={{ top: "10%", right: "24%" }} />
      <Scribble color="var(--corner-orange)" dashed style={{ top: "16%", right: "8%" }} w={150} h={45} />
      <RingCircle color="var(--corner-orange)" size={14} style={{ top: "18%", right: "6%" }} />

      <DotGrid color="var(--corner-blue)" style={{ top: "42%", left: "4%" }} />
      <DotGrid color="var(--corner-red)" style={{ top: "42%", right: "4%" }} />

      <XMark color="var(--corner-green)" size={18} style={{ top: "61%", left: "5.5%" }} />
      <XMark color="var(--corner-blue)" size={18} style={{ top: "60%", right: "5%" }} />

      <Scribble color="#B9B9B9" style={{ top: "56%", right: "12%" }} w={100} h={35} />

      <Scribble color="var(--corner-red)" style={{ bottom: "18%", left: "6%" }} w={120} h={38} />
      <RingCircle color="var(--corner-red)" size={18} style={{ bottom: "13%", left: "14%" }} />

      <Scribble color="var(--corner-green)" style={{ bottom: "10%", right: "13%" }} w={110} h={36} />
      <Dot color="var(--corner-green)" style={{ bottom: "20%", right: "10%" }} size={6} />

      <Dot color="#C7C7C7" style={{ top: "24%", left: "3%" }} size={4} />
      <Dot color="#C7C7C7" style={{ top: "34%", left: "1.5%" }} size={4} />
      <Dot color="#C7C7C7" style={{ top: "78%", left: "26%" }} size={4} />
      <Dot color="#C7C7C7" style={{ top: "88%", left: "37%" }} size={4} />
      <Dot color="#C7C7C7" style={{ top: "91%", right: "34%" }} size={4} />
      <Dot color="#C7C7C7" style={{ top: "35%", right: "1.5%" }} size={4} />
    </div>
  );
}

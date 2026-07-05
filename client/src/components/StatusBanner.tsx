import type { ReactNode } from "react";

type StatusBannerProps = {
  icon?: ReactNode;
  text: ReactNode;
  className?: string;
};

function StatusBanner({ icon, text, className = "" }: StatusBannerProps) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-center text-sm font-semibold shadow-lg ${className}`}
      style={{
        background: "var(--menu-header)",
        borderColor: "var(--menu-border)",
        color: "var(--menu-heading)",
      }}
    >
      <span className="inline-flex items-center gap-2">
        {icon}
        <span>{text}</span>
      </span>
    </div>
  );
}

export default StatusBanner;

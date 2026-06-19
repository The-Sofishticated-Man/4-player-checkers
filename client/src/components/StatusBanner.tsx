import type { ReactNode } from "react";

type StatusBannerProps = {
  icon?: ReactNode;
  text: ReactNode;
  className?: string;
};

function StatusBanner({ icon, text, className = "" }: StatusBannerProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-700 shadow-lg ${className}`}
    >
      <span className="inline-flex items-center gap-2">
        {icon}
        <span>{text}</span>
      </span>
    </div>
  );
}

export default StatusBanner;

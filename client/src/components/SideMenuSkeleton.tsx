import { panelTheme } from "../utils/sideMenuThemes";

function SideMenuSkeleton() {
  return (
    <div
      className="fixed top-4 right-4 w-[340px] max-w-[calc(100vw-2rem)] rounded-3xl border p-4 backdrop-blur-md"
      style={panelTheme}
    >
      <div className="animate-pulse space-y-3">
        <div className="h-10 rounded-2xl bg-slate-200" />
        <div className="h-10 rounded-2xl bg-slate-200" />
        <div className="h-24 rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}

export default SideMenuSkeleton;

import { panelTheme } from "../utils/sideMenuThemes";

function SideMenuSkeleton() {
  return (
    <div
      className="fixed right-4 top-1/2 w-[340px] max-w-[calc(100vw-2rem)] -translate-y-1/2 rounded-3xl border p-4 backdrop-blur-md"
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

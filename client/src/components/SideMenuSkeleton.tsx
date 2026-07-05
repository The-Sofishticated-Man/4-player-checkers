import { panelTheme } from "../utils/sideMenuThemes";

function SideMenuSkeleton() {
  return (
    <div
      className="fixed right-[66px] top-1/2 z-40 w-[340px] max-w-[calc(100vw-2rem)] -translate-y-1/2 rounded-2xl border p-4 backdrop-blur-md"
      style={panelTheme}
    >
      <div className="animate-pulse space-y-3">
        <div
          className="h-10 rounded-2xl"
          style={{ background: "var(--menu-skeleton)" }}
        />
        <div
          className="h-10 rounded-2xl"
          style={{ background: "var(--menu-skeleton)" }}
        />
        <div
          className="h-24 rounded-2xl"
          style={{ background: "var(--menu-skeleton-soft)" }}
        />
      </div>
    </div>
  );
}

export default SideMenuSkeleton;

const Cell = ({
  isDark,
  children,
  row,
  column,
}: {
  isDark: boolean;
  children: React.ReactNode;
  row: number;
  column: number;
}) => {
  return (
    <div
      className={`${
        isDark ? "bg-amber-700" : "bg-amber-200"
      } flex items-center justify-center aspect-square w-20 h-20`}
    >
      {children}
    </div>
  );
};

export default Cell;

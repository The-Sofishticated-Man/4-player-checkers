const Cell = ({
  isDark,
  children,
}: {
  isDark: boolean;
  children: React.ReactNode;
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

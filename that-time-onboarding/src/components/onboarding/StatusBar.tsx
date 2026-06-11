type StatusBarProps = {
  tone?: "dark" | "light";
};

export function StatusBar({ tone = "dark" }: StatusBarProps) {
  const isLight = tone === "light";
  const color = isLight ? "text-white" : "text-navy";
  const bar = isLight ? "bg-white" : "bg-navy";

  return (
    <div className={`flex h-12 shrink-0 items-center justify-between px-8 ${color}`}>
      <div className="text-[15px] font-semibold leading-none">9:41</div>
      <div className="flex items-center gap-2">
        <div className="flex h-4 items-end gap-0.5" aria-hidden="true">
          {[6, 8, 11, 14].map((height) => (
            <span
              key={height}
              className={`w-1 rounded-full ${bar}`}
              style={{ height }}
            />
          ))}
        </div>
        <div className="relative h-4 w-5" aria-hidden="true">
          <span
            className={`absolute left-0 top-1 h-3 w-5 rounded-t-full border-2 border-b-0 ${isLight ? "border-white" : "border-navy"}`}
          />
          <span
            className={`absolute left-[7px] top-[10px] h-1.5 w-1.5 rounded-full ${bar}`}
          />
        </div>
        <div
          className={`relative h-[14px] w-[27px] rounded-[5px] border ${isLight ? "border-white" : "border-navy"}`}
          aria-hidden="true"
        >
          <span className={`absolute left-0.5 top-0.5 h-2 w-5 rounded-[3px] ${bar}`} />
          <span className={`absolute -right-1 top-1 h-1.5 w-0.5 rounded-r ${bar}`} />
        </div>
      </div>
    </div>
  );
}

"use client";

export function DashboardWorkspace({
  leftHeader,
  leftChildren,
  rightChildren,
}: {
  leftHeader: React.ReactNode;
  leftChildren: React.ReactNode;
  rightChildren: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-1">
      <div className="flex h-full min-h-0 w-1/2 shrink-0 flex-col bg-[rgba(0,0,0,0.25)] backdrop-blur-xl">
        <div className="flex shrink-0 items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/images/ben-uribe.png"
              alt="Ben Uribe"
              className="size-6 rounded-full object-cover"
            />
            <span className="text-[13px] leading-[17px] font-medium text-ink-secondary">
              Ben Uribe
            </span>
          </div>
          {leftHeader}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{leftChildren}</div>
      </div>

      <div className="flex h-full min-h-0 w-1/2 min-w-0 flex-col">{rightChildren}</div>
    </div>
  );
}

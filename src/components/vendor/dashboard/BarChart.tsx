type BarChartProps = {
  data: { label: string; submitted: number; approved: number; rejected: number }[];
};

export function BarChart({ data }: BarChartProps) {
  const maxVal = Math.max(...data.map((d) => d.submitted), 1);
  const BAR_HEIGHT = 160; // px

  return (
    <div className="w-full">
      {/* Y-axis labels + bars */}
      <div className="flex items-end gap-1 sm:gap-2" style={{ height: BAR_HEIGHT + 24 }}>
        {/* Y axis */}
        <div className="flex flex-col justify-between text-right pr-2 shrink-0" style={{ height: BAR_HEIGHT }}>
          {[maxVal, Math.round(maxVal * 0.75), Math.round(maxVal * 0.5), Math.round(maxVal * 0.25), 0].map((v) => (
            <span key={v} className="text-xs text-muted-foreground leading-none">{v}</span>
          ))}
        </div>

        {/* Grid + bars area */}
        <div className="flex-1 relative" style={{ height: BAR_HEIGHT + 24 }}>
          {/* Horizontal grid lines */}
          <div className="absolute inset-x-0 top-0 flex flex-col justify-between pointer-events-none" style={{ height: BAR_HEIGHT }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="w-full border-t border-border/50" />
            ))}
          </div>

          {/* Bars */}
          <div className="absolute inset-x-0 top-0 flex items-end gap-1 sm:gap-2 px-1" style={{ height: BAR_HEIGHT }}>
            {data.map((d) => (
              <div key={d.label} className="flex-1 flex items-end justify-center gap-0.5">
                {/* Submitted */}
                <div className="group relative flex-1 flex items-end">
                  <div
                    className="w-full rounded-t bg-primary/70 hover:bg-primary transition-all cursor-pointer"
                    style={{ height: `${(d.submitted / maxVal) * BAR_HEIGHT}px`, minHeight: d.submitted > 0 ? "4px" : "0" }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                      <div className="bg-foreground text-background text-xs rounded px-2 py-1 whitespace-nowrap shadow">
                        Submitted: {d.submitted}
                      </div>
                      <div className="w-1.5 h-1.5 bg-foreground rotate-45 -mt-0.5" />
                    </div>
                  </div>
                </div>

                {/* Approved */}
                <div className="group relative flex-1 flex items-end">
                  <div
                    className="w-full rounded-t bg-green-400 hover:bg-green-500 transition-all cursor-pointer"
                    style={{ height: `${(d.approved / maxVal) * BAR_HEIGHT}px`, minHeight: d.approved > 0 ? "4px" : "0" }}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                      <div className="bg-foreground text-background text-xs rounded px-2 py-1 whitespace-nowrap shadow">
                        Approved: {d.approved}
                      </div>
                      <div className="w-1.5 h-1.5 bg-foreground rotate-45 -mt-0.5" />
                    </div>
                  </div>
                </div>

                {/* Rejected */}
                <div className="group relative flex-1 flex items-end">
                  <div
                    className="w-full rounded-t bg-red-400 hover:bg-red-500 transition-all cursor-pointer"
                    style={{ height: `${(d.rejected / maxVal) * BAR_HEIGHT}px`, minHeight: d.rejected > 0 ? "4px" : "0" }}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                      <div className="bg-foreground text-background text-xs rounded px-2 py-1 whitespace-nowrap shadow">
                        Rejected: {d.rejected}
                      </div>
                      <div className="w-1.5 h-1.5 bg-foreground rotate-45 -mt-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* X-axis labels */}
          <div className="absolute inset-x-0 flex gap-1 sm:gap-2 px-1" style={{ top: BAR_HEIGHT + 6 }}>
            {data.map((d) => (
              <div key={d.label} className="flex-1 text-center">
                <span className="text-xs text-muted-foreground">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
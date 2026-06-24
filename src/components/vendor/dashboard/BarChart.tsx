type BarChartProps = {
  data: {
    label: string;
    submitted: number;
    approved: number;
    rejected: number;
  }[];
};

export function BarChart({ data }: BarChartProps) {
  const BAR_HEIGHT = 160;

  const actualMax = Math.max(
    1,
    ...data.flatMap((d) => [d.submitted, d.approved, d.rejected]),
  );

  const maxVal = Math.max(10, Math.ceil(actualMax / 10) * 10);

  const yTicks = [
    maxVal,
    Math.round(maxVal * 0.75),
    Math.round(maxVal * 0.5),
    Math.round(maxVal * 0.25),
    0,
  ];

  const hasData = data.some(
    (d) => d.submitted > 0 || d.approved > 0 || d.rejected > 0,
  );

  if (!hasData) {
    return (
      <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">
        No ASN activity available
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-end gap-2" style={{ height: BAR_HEIGHT + 28 }}>
        {/* Y Axis */}
        <div
          className="flex flex-col justify-between text-right pr-2 shrink-0"
          style={{ height: BAR_HEIGHT }}
        >
          {yTicks.map((v) => (
            <span
              key={v}
              className="text-xs text-muted-foreground leading-none"
            >
              {v}
            </span>
          ))}
        </div>

        {/* Chart Area */}
        <div className="flex-1 relative" style={{ height: BAR_HEIGHT + 28 }}>
          {/* Grid Lines */}
          <div
            className="absolute inset-x-0 top-0 flex flex-col justify-between pointer-events-none"
            style={{ height: BAR_HEIGHT }}
          >
            {yTicks.map((_, index) => (
              <div key={index} className="border-t border-border/50 w-full" />
            ))}
          </div>

          {/* Bars */}
          <div
            className="absolute inset-x-0 top-0 flex items-end gap-2 px-1"
            style={{ height: BAR_HEIGHT }}
          >
            {data.map((d) => (
              <div
                key={d.label}
                className="flex-1 flex items-end justify-center gap-1"
              >
                {/* Submitted */}
                <Bar
                  value={d.submitted}
                  max={maxVal}
                  height={BAR_HEIGHT}
                  color="bg-primary"
                  label={`Submitted: ${d.submitted}`}
                />

                {/* Approved */}
                <Bar
                  value={d.approved}
                  max={maxVal}
                  height={BAR_HEIGHT}
                  color="bg-success"
                  label={`Approved: ${d.approved}`}
                />

                {/* Rejected */}
                <Bar
                  value={d.rejected}
                  max={maxVal}
                  height={BAR_HEIGHT}
                  color="bg-danger"
                  label={`Rejected: ${d.rejected}`}
                />
              </div>
            ))}
          </div>

          {/* X Axis */}
          <div
            className="absolute inset-x-0 flex gap-2 px-1"
            style={{ top: BAR_HEIGHT + 6 }}
          >
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

type SingleBarProps = {
  value: number;
  max: number;
  height: number;
  color: string;
  label: string;
};

function Bar({ value, max, height, color, label }: SingleBarProps) {
  const calculatedHeight = value > 0 ? Math.max((value / max) * height, 8) : 0;

  return (
    <div className="group relative flex-1 flex items-end">
      <div
        className={`w-full rounded-t ${color} opacity-80 hover:opacity-100 transition-all duration-300 cursor-pointer`}
        style={{
          height: `${calculatedHeight}px`,
        }}
      >
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
          <div className="bg-foreground text-background text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
            {label}
          </div>
          <div className="w-2 h-2 bg-foreground rotate-45 -mt-1" />
        </div>
      </div>
    </div>
  );
}

import { ResponsiveContainer, RadarChart, Radar, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Legend, Tooltip } from "recharts";
import type { DimensionAvg } from "@/lib/cohort-stats";

type Series = { name: string; data: DimensionAvg[]; color: string };

export function AggregateRadar({ series, height = 300 }: { series: Series[]; height?: number }) {
  if (!series.length) return null;
  // Build merged data by dimension
  const dims = series[0].data.map((d) => d.dimension);
  const data = dims.map((dim) => {
    const row: Record<string, string | number> = { dimension: dim };
    for (const s of series) {
      const found = s.data.find((d) => d.dimension === dim);
      row[s.name] = found?.score ?? 0;
    }
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis dataKey="dimension" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
        {series.map((s) => (
          <Radar key={s.name} name={s.name} dataKey={s.name} stroke={s.color} fill={s.color} fillOpacity={0.25} />
        ))}
        <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))" }} />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
}

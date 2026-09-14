import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";

export function EvolutionChart({ data, height = 260 }: { data: { period: string; score: number }[]; height?: number }) {
  if (!data.length) return <p className="text-sm text-muted-foreground">Sem evolução para exibir.</p>;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="period" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
        <ReferenceLine y={65} stroke="var(--primary)" strokeDasharray="4 4" />
        <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))" }} />
        <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--primary)" }} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

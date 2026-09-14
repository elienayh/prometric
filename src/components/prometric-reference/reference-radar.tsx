import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { dimensionScores } from "@/lib/prometric-method";
import type { Classifications } from "@/lib/proesp";
import { EXPECTED_DIMENSION_RANGE, REFERENCE_LABEL } from "@/lib/prometric-reference";

export interface ReferenceRadarProps {
  /** Classificações da avaliação atual do aluno. */
  classifications: Classifications;
  /** Classificações da primeira avaliação (opcional). */
  firstClassifications?: Classifications | null;
  title?: string;
  height?: number;
}

/**
 * Radar com sobreposição: Referência ProMetric® + Aluno (atual) e
 * opcionalmente a primeira avaliação. Permite ver imediatamente déficits
 * e pontos fortes em relação ao esperado para idade/sexo.
 */
export function ReferenceRadar({
  classifications,
  firstClassifications,
  title = `Radar — Aluno × ${REFERENCE_LABEL}`,
  height = 320,
}: ReferenceRadarProps) {
  const dims = dimensionScores(classifications);
  const firstDims = firstClassifications ? dimensionScores(firstClassifications) : null;

  // Referência ProMetric® = topo da faixa esperada (limite superior do "Dentro do esperado").
  // Reusa apenas valores já existentes — sem novos cálculos.
  const refValue = EXPECTED_DIMENSION_RANGE.max;

  const data = dims.map((d, i) => ({
    dim: d.dimension.split(" ")[0],
    Referência: refValue,
    Aluno: d.score,
    ...(firstDims ? { Inicial: firstDims[i]?.score ?? 0 } : {}),
  }));

  return (
    <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-soft">
      <h2 className="mb-3 font-display text-sm font-semibold">{title}</h2>
      <div className="w-full" style={{ height }}>
        <ResponsiveContainer>
          <RadarChart data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="dim" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={10} />
            {/* Faixa de Referência ProMetric® como camada de fundo */}
            <Radar
              name={REFERENCE_LABEL}
              dataKey="Referência"
              stroke="#22c55e"
              strokeDasharray="4 4"
              fill="#22c55e"
              fillOpacity={0.12}
            />
            {firstDims && (
              <Radar
                name="1ª avaliação"
                dataKey="Inicial"
                stroke="#94a3b8"
                fill="#94a3b8"
                fillOpacity={0.15}
              />
            )}
            <Radar
              name="Aluno (atual)"
              dataKey="Aluno"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.45}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-center text-[10px] text-muted-foreground">
        A linha tracejada verde representa o nível mínimo esperado para idade e sexo (Referência ProMetric®).
      </p>
    </div>
  );
}

"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type ChartPoint = {
  period: string;
  label: string;
  observed: number | null;
  forecast: number | null;
  low: number | null;
  high: number | null;
};

type Props = {
  data: ChartPoint[];
  firstForecastLabel: string | null;
  labels: {
    observed: string;
    forecast: string;
    range: string;
    forecastStart: string;
  };
  unitLabel: string;
  ariaLabel: string;
  caption: string;
};

/**
 * Observed values and forecast values are separate series, so the chart never
 * draws a forecast as if it were an observation. Colour is paired with line style
 * (solid vs dashed) so the difference survives greyscale printing and colour blindness.
 */
export function PriceChart({ data, firstForecastLabel, labels, unitLabel, ariaLabel, caption }: Props) {
  return (
    <figure>
      <div role="img" aria-label={ariaLabel} className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 16, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid stroke="#d9d3c2" strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fill: "#55645a", fontSize: 12 }} />
            <YAxis
              tick={{ fill: "#55645a", fontSize: 12 }}
              label={{ value: unitLabel, angle: -90, position: "insideLeft", fill: "#55645a", fontSize: 12 }}
            />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey={(d: ChartPoint) => (d.low !== null && d.high !== null ? [d.low, d.high] : null)}
              name={labels.range}
              stroke="none"
              fill="#dcebc8"
              fillOpacity={0.8}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="observed"
              name={labels.observed}
              stroke="#1f4d2b"
              strokeWidth={3}
              dot={{ r: 4 }}
              connectNulls={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              name={labels.forecast}
              stroke="#5c3d23"
              strokeWidth={2.5}
              strokeDasharray="6 4"
              dot={{ r: 3 }}
              connectNulls={false}
              isAnimationActive={false}
            />
            {firstForecastLabel ? (
              <ReferenceLine
                x={firstForecastLabel}
                stroke="#5c3d23"
                strokeDasharray="2 2"
                label={{ value: labels.forecastStart, position: "top", fill: "#5c3d23", fontSize: 12 }}
              />
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="mt-2 text-sm text-muted">{caption}</figcaption>
    </figure>
  );
}

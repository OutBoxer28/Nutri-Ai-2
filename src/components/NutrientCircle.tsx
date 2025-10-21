"use client";

import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";

type NutrientCircleProps = {
  name: string;
  consumed: number;
  goal: number;
  color: string;
  unit?: string;
};

export const NutrientCircle = ({
  name,
  consumed,
  goal,
  color,
  unit = "g",
}: NutrientCircleProps) => {
  const percentage = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;
  const data = [{ name, value: percentage }];

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="w-24 h-24 relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="80%"
            outerRadius="100%"
            data={data}
            startAngle={90}
            endAngle={-270}
            barSize={8}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: "hsl(var(--secondary))" }}
              dataKey="value"
              cornerRadius={10}
              fill={color}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold">{consumed}</span>
          <span className="text-xs text-muted-foreground">
            / {goal}
            {unit}
          </span>
        </div>
      </div>
      <p className="text-sm font-medium">{name}</p>
    </div>
  );
};
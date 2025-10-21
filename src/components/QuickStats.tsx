"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

type MealLogWithFood = {
  foods: {
    protein: number;
    carbs: number;
    fats: number;
  } | null;
  quantity: number;
};

const StatCard = ({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon?: React.ElementType;
}) => (
  <div className="flex flex-col items-center justify-center p-4 bg-secondary rounded-lg">
    {Icon && <Icon className="h-6 w-6 mb-2 text-muted-foreground" />}
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-sm text-muted-foreground">{title}</p>
  </div>
);

export const QuickStats = () => {
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: mealLogs } = useQuery({
    queryKey: ["mealLogs", today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meal_logs")
        .select("quantity, foods(protein, carbs, fats)")
        .eq("log_date", today);
      if (error) throw new Error(error.message);
      return data as MealLogWithFood[];
    },
  });

  const totals = { protein: 0, carbs: 0, fats: 0 };
  mealLogs?.forEach((log) => {
    if (log.foods) {
      totals.protein += log.foods.protein * log.quantity;
      totals.carbs += log.foods.carbs * log.quantity;
      totals.fats += log.foods.fats * log.quantity;
    }
  });

  const totalMacros = totals.protein + totals.carbs + totals.fats;

  const macroData = [
    {
      name: "Protein",
      value: totalMacros > 0 ? (totals.protein / totalMacros) * 100 : 0,
      color: "hsl(var(--primary))",
    },
    {
      name: "Carbs",
      value: totalMacros > 0 ? (totals.carbs / totalMacros) * 100 : 33,
      color: "hsl(var(--warning))",
    },
    {
      name: "Fats",
      value: totalMacros > 0 ? (totals.fats / totalMacros) * 100 : 33,
      color: "hsl(var(--destructive))",
    },
  ];

  return (
    <Card className="bg-card border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-base font-medium">Quick Stats</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 grid grid-cols-2 md:grid-cols-1 gap-4">
          <StatCard title="Weekly Avg" value="-" />
          <StatCard title="Streak" value="-" icon={Flame} />
        </div>
        <div className="md:col-span-2 flex flex-col items-center justify-center min-h-[150px]">
          <p className="text-sm font-medium mb-2">Macro Ratio</p>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie
                data={macroData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={50}
                innerRadius={30}
                fill="#8884d8"
                dataKey="value"
                stroke="hsl(var(--background))"
                strokeWidth={2}
              >
                {macroData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend
                iconSize={10}
                layout="vertical"
                verticalAlign="middle"
                align="right"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
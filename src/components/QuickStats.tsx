"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay, isSameDay } from "date-fns";
import { Skeleton } from "./ui/skeleton";

type MealLogWithFood = {
  foods: {
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  }[] | null;
  quantity: number;
  log_date: string;
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  isLoading,
}: {
  title: string;
  value: string;
  icon?: React.ElementType;
  isLoading?: boolean;
}) => (
  <div className="flex flex-col items-center justify-center p-4 bg-secondary rounded-lg">
    {isLoading ? (
      <>
        <Skeleton className="h-8 w-12 mb-2" />
        <Skeleton className="h-4 w-20" />
      </>
    ) : (
      <>
        {Icon && <Icon className="h-6 w-6 mb-2 text-muted-foreground" />}
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </>
    )}
  </div>
);

interface QuickStatsProps {
  date: Date;
}

export const QuickStats = ({ date }: QuickStatsProps) => {
  const formattedDate = format(date, "yyyy-MM-dd");

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (error) throw new Error(error.message);
      return data;
    }
  });

  const { data: historicLogs, isLoading: isLoadingHistoric } = useQuery({
    queryKey: ["historicMealLogs"],
    queryFn: async () => {
      const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("meal_logs")
        .select("quantity, log_date, foods(calories)")
        .gte("log_date", thirtyDaysAgo);
      if (error) throw new Error(error.message);
      return data as MealLogWithFood[];
    },
  });

  const { data: mealLogs, isLoading: isLoadingToday } = useQuery({
    queryKey: ["mealLogs", formattedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meal_logs")
        .select("quantity, foods(protein, carbs, fats)")
        .eq("log_date", formattedDate);
      if (error) throw new Error(error.message);
      return data as MealLogWithFood[];
    },
  });

  const calculateStats = () => {
    if (!historicLogs || !profile) return { weeklyAvg: "-", streak: "-" };

    // Calculate Weekly Average
    const sevenDaysAgo = startOfDay(subDays(new Date(), 6));
    const recentLogs = historicLogs.filter(log => new Date(log.log_date) >= sevenDaysAgo);
    
    const caloriesByDay = recentLogs.reduce((acc, log) => {
      const day = format(new Date(log.log_date), "yyyy-MM-dd");
      const food = log.foods?.[0];
      if (food) {
        acc[day] = (acc[day] || 0) + food.calories * log.quantity;
      }
      return acc;
    }, {} as Record<string, number>);

    const dailyTotals = Object.values(caloriesByDay);
    const weeklyAvg = dailyTotals.length > 0 
      ? (dailyTotals.reduce((sum, total) => sum + total, 0) / dailyTotals.length).toFixed(0)
      : "0";

    // Calculate Streak
    let streak = 0;
    const calorieGoal = profile.calorie_goal || 0;
    for (let i = 1; i <= 30; i++) {
      const dayToCheck = startOfDay(subDays(new Date(), i));
      const logsForDay = historicLogs.filter(log => isSameDay(new Date(log.log_date), dayToCheck));
      
      if (logsForDay.length === 0) break; // Streak broken if a day is missed

      const totalCalories = logsForDay.reduce((sum, log) => {
        const food = log.foods?.[0];
        return sum + (food ? food.calories * log.quantity : 0);
      }, 0);

      if (totalCalories <= calorieGoal) {
        streak++;
      } else {
        break; // Streak broken if goal is exceeded
      }
    }

    return { weeklyAvg, streak: streak.toString() };
  };

  const { weeklyAvg, streak } = calculateStats();

  const totals = { protein: 0, carbs: 0, fats: 0 };
  mealLogs?.forEach((log) => {
    const food = log.foods?.[0];
    if (food) {
      totals.protein += food.protein * log.quantity;
      totals.carbs += food.carbs * log.quantity;
      totals.fats += food.fats * log.quantity;
    }
  });

  const totalMacros = totals.protein + totals.carbs + totals.fats;

  const macroData = [
    { name: "Protein", value: totalMacros > 0 ? (totals.protein / totalMacros) * 100 : 0, color: "hsl(var(--primary))" },
    { name: "Carbs", value: totalMacros > 0 ? (totals.carbs / totalMacros) * 100 : 33, color: "hsl(var(--warning))" },
    { name: "Fats", value: totalMacros > 0 ? (totals.fats / totalMacros) * 100 : 33, color: "hsl(var(--destructive))" },
  ];

  const isLoading = isLoadingProfile || isLoadingHistoric || isLoadingToday;

  return (
    <Card className="bg-card border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-base font-medium">Quick Stats</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 grid grid-cols-2 md:grid-cols-1 gap-4">
          <StatCard title="Weekly Avg" value={weeklyAvg} isLoading={isLoading} />
          <StatCard title="Streak" value={streak} icon={Flame} isLoading={isLoading} />
        </div>
        <div className="md:col-span-2 flex flex-col items-center justify-center min-h-[150px]">
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <>
              <p className="text-sm font-medium mb-2">Macro Ratio</p>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={macroData} cx="50%" cy="50%" labelLine={false} outerRadius={50} innerRadius={30} fill="#8884d8" dataKey="value" stroke="hsl(var(--background))" strokeWidth={2}>
                    {macroData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                  </Pie>
                  <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
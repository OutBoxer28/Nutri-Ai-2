import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NutrientCircle } from "./NutrientCircle";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

type MealLogWithFood = {
  foods: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  quantity: number;
};

export const DailySummaryCard = () => {
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: mealLogs } = useQuery({
    queryKey: ["mealLogs", today],
    queryFn: async (): Promise<MealLogWithFood[]> => {
      const { data, error } = await supabase
        .from("meal_logs")
        .select("quantity, foods(calories, protein, carbs, fats)")
        .eq("log_date", today);
      if (error) throw new Error(error.message);
      return data as MealLogWithFood[];
    },
  });

  const totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  };

  mealLogs?.forEach((log) => {
    if (log.foods) {
      totals.calories += log.foods.calories * log.quantity;
      totals.protein += log.foods.protein * log.quantity;
      totals.carbs += log.foods.carbs * log.quantity;
      totals.fats += log.foods.fats * log.quantity;
    }
  });

  // Goals are hardcoded for now. A future feature could make these user-configurable.
  const goals = {
    calories: 2200,
    protein: 150,
    carbs: 250,
    fats: 70,
  };

  const remainingCalories = goals.calories - totals.calories;

  return (
    <Card className="bg-card border-none shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Daily Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground">Calories Remaining</p>
          <p className="text-5xl font-bold text-primary">
            {remainingCalories.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <NutrientCircle
            name="Protein"
            consumed={Math.round(totals.protein)}
            goal={goals.protein}
            color="hsl(var(--primary))"
          />
          <NutrientCircle
            name="Carbs"
            consumed={Math.round(totals.carbs)}
            goal={goals.carbs}
            color="hsl(var(--warning))"
          />
          <NutrientCircle
            name="Fats"
            consumed={Math.round(totals.fats)}
            goal={goals.fats}
            color="hsl(var(--destructive))"
          />
        </div>
      </CardContent>
    </Card>
  );
};
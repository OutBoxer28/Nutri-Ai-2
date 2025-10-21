import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NutrientCircle } from "./NutrientCircle";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Skeleton } from "./ui/skeleton";

type MealLogWithFood = {
  foods: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }[] | null;
  quantity: number;
};

interface DailySummaryCardProps {
  date: Date;
}

export const DailySummaryCard = ({ date }: DailySummaryCardProps) => {
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

  const { data: mealLogs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ["mealLogs", formattedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meal_logs")
        .select("quantity, foods(calories, protein, carbs, fats)")
        .eq("log_date", formattedDate);
      if (error) throw new Error(error.message);
      return data as MealLogWithFood[];
    },
  });

  if (isLoadingProfile || isLoadingLogs) {
    return (
      <Card className="bg-card border-none shadow-lg">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <Skeleton className="h-4 w-24 mx-auto mb-2" />
            <Skeleton className="h-12 w-40 mx-auto" />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  };

  mealLogs?.forEach((log) => {
    const food = log.foods?.[0];
    if (food) {
      totals.calories += food.calories * log.quantity;
      totals.protein += food.protein * log.quantity;
      totals.carbs += food.carbs * log.quantity;
      totals.fats += food.fats * log.quantity;
    }
  });

  const goals = {
    calories: profile?.calorie_goal || 2200,
    protein: profile?.protein_goal || 150,
    carbs: profile?.carb_goal || 250,
    fats: profile?.fat_goal || 70,
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
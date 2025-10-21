"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddFoodDrawer } from "./AddFoodDrawer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

type MealLogWithFood = {
  foods: {
    calories: number;
  } | null;
  quantity: number;
  meal_type: "Breakfast" | "Lunch" | "Dinner" | "Snacks";
};

const MealCard = ({
  mealType,
  calories,
  onAddClick,
}: {
  mealType: string;
  calories: number;
  onAddClick: () => void;
}) => (
  <Card className="bg-secondary">
    <CardHeader className="flex flex-row items-center justify-between p-4">
      <div>
        <CardTitle className="text-lg">{mealType}</CardTitle>
        <p className="text-sm text-muted-foreground">{calories.toFixed(0)} kcal</p>
      </div>
      <Button size="icon" variant="outline" onClick={onAddClick}>
        <Plus className="h-5 w-5" />
      </Button>
    </CardHeader>
  </Card>
);

export const MealTimeline = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState("");
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: mealLogs } = useQuery({
    queryKey: ["mealLogs", today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meal_logs")
        .select("quantity, meal_type, foods(calories)")
        .eq("log_date", today);
      if (error) throw new Error(error.message);
      return data as MealLogWithFood[];
    },
  });

  const mealCalories = {
    Breakfast: 0,
    Lunch: 0,
    Dinner: 0,
    Snacks: 0,
  };

  mealLogs?.forEach((log) => {
    if (log.foods) {
      mealCalories[log.meal_type] += log.foods.calories * log.quantity;
    }
  });

  const meals = Object.entries(mealCalories).map(([type, calories]) => ({
    type,
    calories,
  }));

  const handleAddFoodClick = (mealType: string) => {
    setSelectedMealType(mealType);
    setIsDrawerOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        {meals.map((meal) => (
          <MealCard
            key={meal.type}
            mealType={meal.type}
            calories={meal.calories}
            onAddClick={() => handleAddFoodClick(meal.type)}
          />
        ))}
      </div>
      <AddFoodDrawer
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        mealType={selectedMealType}
      />
    </>
  );
};
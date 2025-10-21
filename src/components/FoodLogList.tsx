"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { LoggedFoodItem } from "./LoggedFoodItem";

type MealLog = {
  id: string;
  log_date: string;
  meal_type: string;
  quantity: number;
  foods: {
    name: string;
    calories: number;
    serving_size: string;
  }[] | null;
};

const groupLogsByDate = (logs: MealLog[]) => {
  return logs.reduce((acc, log) => {
    const date = log.log_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(log);
    return acc;
  }, {} as Record<string, MealLog[]>);
};

const groupLogsByMeal = (logs: MealLog[]) => {
  return logs.reduce((acc, log) => {
    const mealType = log.meal_type;
    if (!acc[mealType]) {
      acc[mealType] = [];
    }
    acc[mealType].push(log);
    return acc;
  }, {} as Record<string, MealLog[]>);
};

export const FoodLogList = () => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["foodLog"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meal_logs")
        .select("id, log_date, meal_type, quantity, foods(name, calories, serving_size)")
        .order("log_date", { ascending: false });

      if (error) throw new Error(error.message);
      return data as MealLog[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  const groupedByDate = groupLogsByDate(logs || []);
  const dates = Object.keys(groupedByDate);

  return (
    <div>
      {dates.length === 0 ? (
        <p className="text-center text-muted-foreground mt-8">
          Your food log is empty. Start by adding a meal on the dashboard!
        </p>
      ) : (
        <Accordion type="single" collapsible defaultValue={dates[0]}>
          {dates.map((date) => {
            const dayLogs = groupedByDate[date];
            const totalCalories = dayLogs.reduce(
              (sum, log) => sum + (log.foods?.[0]?.calories || 0) * log.quantity,
              0
            );
            const groupedByMeal = groupLogsByMeal(dayLogs);

            return (
              <AccordionItem value={date} key={date}>
                <AccordionTrigger className="text-lg font-medium hover:no-underline">
                  <div className="flex justify-between w-full pr-4">
                    <span>{format(parseISO(date), "EEEE, MMMM d")}</span>
                    <span className="text-muted-foreground">
                      {totalCalories.toFixed(0)} kcal
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {Object.entries(groupedByMeal).map(([mealType, mealLogs]) => (
                      <div key={mealType}>
                        <h4 className="font-semibold mb-2 px-3">{mealType}</h4>
                        {mealLogs.map((log) => {
                          const food = log.foods?.[0];
                          return food ? (
                            <LoggedFoodItem
                              key={log.id}
                              logId={log.id}
                              foodName={food.name}
                              calories={food.calories}
                              quantity={log.quantity}
                              servingSize={food.serving_size}
                            />
                          ) : null;
                        })}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
};
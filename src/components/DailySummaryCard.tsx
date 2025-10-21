import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NutrientCircle } from "./NutrientCircle";

const macroData = {
  calories: { consumed: 1580, goal: 2200 },
  protein: { consumed: 120, goal: 150 },
  carbs: { consumed: 180, goal: 250 },
  fats: { consumed: 50, goal: 70 },
};

export const DailySummaryCard = () => {
  const remainingCalories = macroData.calories.goal - macroData.calories.consumed;

  return (
    <Card className="bg-card border-none shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Daily Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground">Calories Remaining</p>
          <p className="text-5xl font-bold text-primary">
            {remainingCalories.toLocaleString()}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <NutrientCircle
            name="Protein"
            consumed={macroData.protein.consumed}
            goal={macroData.protein.goal}
            color="hsl(var(--primary))"
          />
          <NutrientCircle
            name="Carbs"
            consumed={macroData.carbs.consumed}
            goal={macroData.carbs.goal}
            color="hsl(var(--warning))"
          />
          <NutrientCircle
            name="Fats"
            consumed={macroData.fats.consumed}
            goal={macroData.fats.goal}
            color="hsl(var(--destructive))"
          />
        </div>
      </CardContent>
    </Card>
  );
};
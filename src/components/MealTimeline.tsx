import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const MealCard = ({
  mealType,
  calories,
}: {
  mealType: string;
  calories: number;
}) => (
  <Card className="bg-secondary">
    <CardHeader className="flex flex-row items-center justify-between p-4">
      <div>
        <CardTitle className="text-lg">{mealType}</CardTitle>
        <p className="text-sm text-muted-foreground">{calories} kcal</p>
      </div>
      <Button size="icon" variant="outline">
        <Plus className="h-5 w-5" />
      </Button>
    </CardHeader>
  </Card>
);

export const MealTimeline = () => {
  const meals = [
    { type: "Breakfast", calories: 450 },
    { type: "Lunch", calories: 620 },
    { type: "Dinner", calories: 0 },
    { type: "Snacks", calories: 210 },
  ];

  return (
    <div className="space-y-4">
      {meals.map((meal) => (
        <MealCard
          key={meal.type}
          mealType={meal.type}
          calories={meal.calories}
        />
      ))}
    </div>
  );
};
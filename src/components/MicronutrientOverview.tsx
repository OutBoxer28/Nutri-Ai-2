import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";

// Define the structure and goals for micronutrients
const micronutrientGoals = [
  { name: "Iron", goal: 18, unit: "mg" },
  { name: "Calcium", goal: 1000, unit: "mg" },
  { name: "Vitamin C", goal: 90, unit: "mg" },
  { name: "Vitamin D", goal: 15, unit: "µg" },
  { name: "Potassium", goal: 3500, unit: "mg" },
];

const NutrientProgress = ({
  name,
  consumed,
  goal,
  unit,
}: {
  name: string;
  consumed: number;
  goal: number;
  unit: string;
}) => (
  <div className="space-y-1">
    <div className="flex justify-between text-sm">
      <span className="font-medium">{name}</span>
      <span className="text-muted-foreground">
        {consumed}/{goal} {unit}
      </span>
    </div>
    <Progress value={goal > 0 ? (consumed / goal) * 100 : 0} className="h-2" />
  </div>
);

interface MicronutrientOverviewProps {
  date: Date;
}

export const MicronutrientOverview = ({ date }: MicronutrientOverviewProps) => {
  // NOTE: Micronutrient data is not yet tracked in the 'foods' table.
  // As a result, 'consumed' values will be 0 until this is implemented.
  const micronutrients = micronutrientGoals.map(nutrient => ({
    ...nutrient,
    consumed: 0, // All consumed values are 0 for now
  }));

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1" className="border-none">
        <AccordionTrigger className="text-base font-medium bg-card p-4 rounded-lg shadow-lg hover:no-underline">
          Micronutrient Overview
        </AccordionTrigger>
        <AccordionContent className="bg-card p-4 rounded-b-lg mt-1 space-y-4">
          {micronutrients.map((nutrient) => (
            <NutrientProgress key={nutrient.name} {...nutrient} />
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
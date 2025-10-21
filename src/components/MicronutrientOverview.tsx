import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";

const micronutrients = [
  { name: "Iron", consumed: 12, goal: 18, unit: "mg" },
  { name: "Calcium", consumed: 800, goal: 1000, unit: "mg" },
  { name: "Vitamin C", consumed: 70, goal: 90, unit: "mg" },
  { name: "Vitamin D", consumed: 10, goal: 15, unit: "µg" },
  { name: "Potassium", consumed: 2500, goal: 3500, unit: "mg" },
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
    <Progress value={(consumed / goal) * 100} className="h-2" />
  </div>
);

export const MicronutrientOverview = () => {
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
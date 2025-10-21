"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Plus, GlassWater } from "lucide-react";

export const WaterIntakeTracker = () => {
  const [glasses, setGlasses] = useState(4);
  const goal = 8;

  return (
    <Card className="bg-card border-none shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Water Intake</CardTitle>
        <GlassWater className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="flex items-baseline">
          <p className="text-4xl font-bold">{glasses}</p>
          <p className="text-sm text-muted-foreground">/ {goal} glasses</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setGlasses((g) => Math.max(0, g - 1))}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setGlasses((g) => g + 1)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Barcode, Camera, Plus, Search as SearchIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { mockFoodData, Food } from "@/data/foods";
import { Card, CardContent } from "./ui/card";

interface AddFoodDrawerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  mealType: string;
}

export const AddFoodDrawer = ({
  isOpen,
  onOpenChange,
  mealType,
}: AddFoodDrawerProps) => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFoods = mockFoodData.filter((food) =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddFood = (food: Food) => {
    console.log(`Adding ${food.name} to ${mealType}`);
    // In a real app, this would update the global state.
    onOpenChange(false); // Close drawer after adding.
  };

  const content = (
    <Tabs defaultValue="search" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="search">
          <SearchIcon className="h-4 w-4 mr-2" />
          Search
        </TabsTrigger>
        <TabsTrigger value="barcode" disabled>
          <Barcode className="h-4 w-4 mr-2" />
          Barcode
        </TabsTrigger>
        <TabsTrigger value="scan" disabled>
          <Camera className="h-4 w-4 mr-2" />
          Scan
        </TabsTrigger>
      </TabsList>
      <TabsContent value="search" className="mt-4">
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for food..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="mt-4 space-y-2 max-h-[50vh] overflow-y-auto">
          {filteredFoods.map((food) => (
            <Card key={food.id} className="bg-secondary">
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{food.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {food.calories} kcal, {food.servingSize}
                  </p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => handleAddFood(food)}>
                  <Plus className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );

  const title = `Add to ${mealType}`;
  const description = "Search for a food, scan a barcode, or use your camera.";

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent className="p-4">
          <DrawerHeader className="text-left p-0">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="mt-4">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="mt-4">{content}</div>
      </DialogContent>
    </Dialog>
  );
};
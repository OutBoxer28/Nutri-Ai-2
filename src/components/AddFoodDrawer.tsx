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
import { Card, CardContent } from "./ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreateFoodDialog } from "./CreateFoodDialog";
import { showError, showSuccess } from "@/utils/toast";
import { format } from "date-fns";

type Food = {
  id: string;
  name: string;
  calories: number;
  serving_size: string;
};

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
  const [isCreateFoodOpen, setIsCreateFoodOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: foods, isLoading } = useQuery({
    queryKey: ["foods", searchQuery],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("foods")
        .select("id, name, calories, serving_size")
        .ilike("name", `%${searchQuery}%`)
        .limit(10);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: searchQuery.length > 2,
  });

  const handleAddFood = async (food: Food) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      showError("You must be logged in to log food.");
      return;
    }

    const { error } = await supabase.from("meal_logs").insert({
      user_id: user.id,
      food_id: food.id,
      meal_type: mealType,
      log_date: today,
      quantity: 1, // Default quantity
    });

    if (error) {
      showError(`Failed to log ${food.name}.`);
    } else {
      showSuccess(`${food.name} logged successfully!`);
      queryClient.invalidateQueries({ queryKey: ["mealLogs", today] });
      onOpenChange(false);
    }
  };

  const content = (
    <>
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
          <div className="mt-4 space-y-2 max-h-[40vh] overflow-y-auto">
            {isLoading && <p>Loading...</p>}
            {foods?.map((food) => (
              <Card key={food.id} className="bg-secondary">
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{food.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {food.calories} kcal, {food.serving_size}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleAddFood(food)}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      <div className="mt-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsCreateFoodOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Food
        </Button>
      </div>
      <CreateFoodDialog
        isOpen={isCreateFoodOpen}
        onOpenChange={setIsCreateFoodOpen}
      />
    </>
  );

  const title = `Add to ${mealType}`;
  const description =
    "Search for a food, or create a new one to add to your library.";

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
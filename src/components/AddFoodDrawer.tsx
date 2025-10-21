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
import {
  Barcode,
  Camera,
  Plus,
  Search as SearchIcon,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "./ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreateFoodDialog } from "./CreateFoodDialog";
import { showError, showSuccess, showLoading, dismissToast } from "@/utils/toast";
import { format } from "date-fns";
import BarcodeScanner from "./BarcodeScanner";
import { FoodCamera } from "./FoodCamera";

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
  logDate: Date;
}

export const AddFoodDrawer = ({
  isOpen,
  onOpenChange,
  mealType,
  logDate,
}: AddFoodDrawerProps) => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateFoodOpen, setIsCreateFoodOpen] = useState(false);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("search");
  
  // Barcode state
  const [scannedFood, setScannedFood] = useState<any | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Image recognition state
  const [recognizedFoods, setRecognizedFoods] = useState<any[]>([]);
  const [isRecognizing, setIsRecognizing] = useState(false);

  const { data: foods, isLoading: isSearchLoading } = useQuery({
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

  const handleAddFood = async (foodId: string, foodName: string) => {
    const formattedDate = format(logDate, "yyyy-MM-dd");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showError("You must be logged in to log food.");
      return;
    }

    const { error } = await supabase.from("meal_logs").insert({
      user_id: user.id,
      food_id: foodId,
      meal_type: mealType,
      log_date: formattedDate,
      quantity: 1,
    });

    if (error) {
      showError(`Failed to log ${foodName}.`);
    } else {
      showSuccess(`${foodName} logged successfully!`);
      queryClient.invalidateQueries({ queryKey: ["mealLogs", formattedDate] });
      onOpenChange(false);
    }
  };

  // Barcode Scanning Logic
  const handleScanSuccess = async (decodedText: string) => {
    setIsLookingUp(true);
    setScannedFood(null);
    setLookupError(null);
    const toastId = showLoading("Looking up barcode...");

    try {
      const { data, error } = await supabase.functions.invoke("lookup-food-by-barcode", { body: { barcode: decodedText } });
      dismissToast(toastId);
      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);
      setScannedFood(data);
      showSuccess("Food found!");
    } catch (err: any) {
      dismissToast(toastId);
      const errorMessage = err.message || "Could not find food for this barcode.";
      showError(errorMessage);
      setLookupError(errorMessage);
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleScanFailure = (error: string) => console.error(`Barcode scan failed: ${error}`);

  const handleAddScannedFood = async () => {
    if (!scannedFood) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showError("You must be logged in to log food.");
      return;
    }

    const toastId = showLoading(`Adding ${scannedFood.name}...`);
    const { data: newFood, error: insertFoodError } = await supabase.from("foods").insert({ ...scannedFood, user_id: user.id }).select().single();

    if (insertFoodError || !newFood) {
      dismissToast(toastId);
      showError("Failed to save the new food.");
      return;
    }
    await handleAddFood(newFood.id, newFood.name);
    dismissToast(toastId);
    setScannedFood(null);
  };

  // Image Recognition Logic
  const handleCapture = async () => {
    setIsRecognizing(true);
    setRecognizedFoods([]);
    const toastId = showLoading("Analyzing your meal...");

    try {
      const { data, error } = await supabase.functions.invoke("recognize-food-from-image");
      dismissToast(toastId);
      if (error) throw new Error(error.message);
      // Filter out items that don't have nutrition data
      const validFoods = data.foods.filter((food: any) => food.nutrition);
      setRecognizedFoods(validFoods);
      showSuccess("We've identified some items!");
    } catch (err: any) {
      dismissToast(toastId);
      showError(err.message || "Could not analyze the image.");
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleAddRecognizedFood = async (food: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showError("You must be logged in to log food.");
      return;
    }

    const toastId = showLoading(`Adding ${food.name}...`);
    const { data: newFood, error: insertFoodError } = await supabase.from("foods").insert({ ...food.nutrition, name: food.name, user_id: user.id }).select().single();
    
    if (insertFoodError || !newFood) {
      dismissToast(toastId);
      showError("Failed to save the new food.");
      return;
    }
    await handleAddFood(newFood.id, newFood.name);
    dismissToast(toastId);
    // Remove from list after adding
    setRecognizedFoods(prev => prev.filter(f => f.name !== food.name));
  };

  const content = (
    <>
      <Tabs defaultValue="search" className="w-full" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search"><SearchIcon className="h-4 w-4 mr-2" />Search</TabsTrigger>
          <TabsTrigger value="barcode"><Barcode className="h-4 w-4 mr-2" />Barcode</TabsTrigger>
          <TabsTrigger value="scan"><Camera className="h-4 w-4 mr-2" />Scan</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search" className="mt-4">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search for food..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="mt-4 space-y-2 max-h-[40vh] overflow-y-auto">
            {isSearchLoading && <p>Loading...</p>}
            {foods?.map((food) => (
              <Card key={food.id} className="bg-secondary">
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{food.name}</p>
                    <p className="text-sm text-muted-foreground">{food.calories} kcal, {food.serving_size}</p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => handleAddFood(food.id, food.name)}><Plus className="h-5 w-5" /></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="barcode" className="mt-4">
          {activeTab === "barcode" && <BarcodeScanner onScanSuccess={handleScanSuccess} onScanFailure={handleScanFailure} />}
          {isLookingUp && <div className="flex items-center justify-center p-4"><Loader2 className="h-8 w-8 animate-spin" /><p className="ml-2">Looking up barcode...</p></div>}
          {lookupError && <p className="text-destructive text-center p-4">{lookupError}</p>}
          {scannedFood && (
            <Card className="mt-4 bg-secondary">
              <CardContent className="p-3">
                <p className="font-semibold">{scannedFood.name}</p>
                <p className="text-sm text-muted-foreground">{scannedFood.calories} kcal, {scannedFood.serving_size}</p>
                <Button className="w-full mt-2" onClick={handleAddScannedFood}>Add to {mealType}</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="scan" className="mt-4">
          {recognizedFoods.length === 0 ? (
            <FoodCamera onCapture={handleCapture} isRecognizing={isRecognizing} />
          ) : (
            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              <p className="text-sm text-muted-foreground mb-2">We found these items. Please confirm them to add to your log.</p>
              {recognizedFoods.map((food, index) => (
                <Card key={index} className="bg-secondary">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{food.name}</p>
                      <p className="text-sm text-muted-foreground">Confidence: {(food.confidence * 100).toFixed(0)}%</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setRecognizedFoods(prev => prev.filter(f => f.name !== food.name))}><X className="h-5 w-5" /></Button>
                      <Button size="icon" variant="ghost" className="text-primary" onClick={() => handleAddRecognizedFood(food)}><Check className="h-5 w-5" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      <div className="mt-4">
        <Button variant="outline" className="w-full" onClick={() => setIsCreateFoodOpen(true)}><Plus className="h-4 w-4 mr-2" />Create New Food</Button>
      </div>
      <CreateFoodDialog isOpen={isCreateFoodOpen} onOpenChange={setIsCreateFoodOpen} />
    </>
  );

  const title = `Add to ${mealType}`;
  const description = "Search for a food, or create a new one to add to your library.";

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent className="p-4">
          <DrawerHeader className="text-left p-0"><DrawerTitle>{title}</DrawerTitle><DrawerDescription>{description}</DrawerDescription></DrawerHeader>
          <div className="mt-4">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
        <div className="mt-4">{content}</div>
      </DialogContent>
    </Dialog>
  );
};
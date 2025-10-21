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
import { useDebounce } from "@/hooks/use-debounce";

type Food = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
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
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [isCreateFoodOpen, setIsCreateFoodOpen] = useState(false);
  const [createFoodInitialData, setCreateFoodInitialData] = useState<any | undefined>(undefined);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("search");
  
  const [isLookingUp, setIsLookingUp] = useState(false);

  const [recognizedFoods, setRecognizedFoods] = useState<any[]>([]);
  const [isRecognizing, setIsRecognizing] = useState(false);

  const { data: searchResults, isLoading: isSearchLoading, error: searchError } = useQuery({
    queryKey: ["geminiFoodSearch", debouncedSearchQuery],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("search-food-with-gemini", {
        body: { query: debouncedSearchQuery },
      });
      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);
      return data as Food[];
    },
    enabled: debouncedSearchQuery.length > 2,
  });

  const handleSelectSearchResult = (food: Food) => {
    setCreateFoodInitialData(food);
    setIsCreateFoodOpen(true);
    onOpenChange(false);
  };

  const handleScanSuccess = async (decodedText: string) => {
    setIsLookingUp(true);
    const toastId = showLoading("Looking up barcode...");

    try {
      const { data, error } = await supabase.functions.invoke("lookup-food-by-barcode", { body: { barcode: decodedText } });
      dismissToast(toastId);
      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);
      
      setCreateFoodInitialData(data);
      setIsCreateFoodOpen(true);
      onOpenChange(false);
    } catch (err: any) {
      dismissToast(toastId);
      showError(err.message || "Could not find food for this barcode.");
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleScanFailure = (error: string) => console.error(`Barcode scan failed: ${error}`);

  const handleCapture = async () => {
    setIsRecognizing(true);
    setRecognizedFoods([]);
    const toastId = showLoading("Analyzing your meal...");

    try {
      const { data, error } = await supabase.functions.invoke("recognize-food-from-image");
      dismissToast(toastId);
      if (error) throw new Error(error.message);
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

  const handleConfirmRecognizedFood = (food: any) => {
    setCreateFoodInitialData({ ...food.nutrition, name: food.name });
    setIsCreateFoodOpen(true);
    onOpenChange(false);
  };

  const openCreateFoodDialog = () => {
    setCreateFoodInitialData(undefined);
    setIsCreateFoodOpen(true);
  }

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
            <Input type="search" placeholder="e.g., 'bowl of oatmeal with fruit'" className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="mt-4 space-y-2 max-h-[40vh] overflow-y-auto">
            {isSearchLoading && <p className="text-center text-sm text-muted-foreground">Asking Gemini...</p>}
            {searchError && <p className="text-center text-sm text-destructive">{searchError.message}</p>}
            {searchResults?.map((food) => (
              <Card key={food.id} className="bg-secondary">
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{food.name}</p>
                    <p className="text-sm text-muted-foreground">{Math.round(food.calories)} kcal, {food.serving_size}</p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => handleSelectSearchResult(food)}><Plus className="h-5 w-5" /></Button>
                </CardContent>
              </Card>
            ))}
             {searchResults && searchResults.length === 0 && debouncedSearchQuery.length > 2 && !isSearchLoading && (
              <p className="text-center text-sm text-muted-foreground">No results found.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="barcode" className="mt-4">
          {activeTab === "barcode" && <BarcodeScanner onScanSuccess={handleScanSuccess} onScanFailure={handleScanFailure} />}
          {isLookingUp && <div className="flex items-center justify-center p-4"><Loader2 className="h-8 w-8 animate-spin" /><p className="ml-2">Looking up barcode...</p></div>}
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
                      <Button size="icon" variant="ghost" className="text-primary" onClick={() => handleConfirmRecognizedFood(food)}><Check className="h-5 w-5" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      <div className="mt-4">
        <Button variant="outline" className="w-full" onClick={openCreateFoodDialog}><Plus className="h-4 w-4 mr-2" />Create New Food</Button>
      </div>
    </>
  );

  const title = `Add to ${mealType}`;
  const description = "Search for a food, or create a new one to add to your library.";

  return (
    <>
      {isMobile ? (
        <Drawer open={isOpen} onOpenChange={onOpenChange}>
          <DrawerContent className="p-4">
            <DrawerHeader className="text-left p-0"><DrawerTitle>{title}</DrawerTitle><DrawerDescription>{description}</DrawerDescription></DrawerHeader>
            <div className="mt-4">{content}</div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
            <div className="mt-4">{content}</div>
          </DialogContent>
        </Dialog>
      )}
      <CreateFoodDialog 
        isOpen={isCreateFoodOpen} 
        onOpenChange={setIsCreateFoodOpen} 
        initialData={createFoodInitialData}
        mealType={mealType}
        logDate={logDate}
      />
    </>
  );
};
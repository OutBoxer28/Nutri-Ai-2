"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";

type LoggedFoodItemProps = {
  logId: string;
  foodName: string;
  calories: number;
  quantity: number;
  servingSize: string;
};

export const LoggedFoodItem = ({
  logId,
  foodName,
  calories,
  quantity,
  servingSize,
}: LoggedFoodItemProps) => {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    const { error } = await supabase.from("meal_logs").delete().eq("id", logId);

    if (error) {
      showError("Failed to remove item.");
    } else {
      showSuccess("Item removed from log.");
      queryClient.invalidateQueries({ queryKey: ["foodLog"] });
      queryClient.invalidateQueries({ queryKey: ["mealLogs"] });
    }
  };

  return (
    <div className="flex items-center justify-between p-3 hover:bg-secondary rounded-md">
      <div>
        <p className="font-semibold">{foodName}</p>
        <p className="text-sm text-muted-foreground">
          {quantity} x {servingSize} &bull; {(calories * quantity).toFixed(0)} kcal
        </p>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove this
              item from your food log.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
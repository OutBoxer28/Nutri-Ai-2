"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { showSuccess, showError } from "@/utils/toast";
import { format } from "date-fns";

const foodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  calories: z.coerce.number().min(0, "Calories must be positive"),
  protein: z.coerce.number().min(0, "Protein must be positive"),
  carbs: z.coerce.number().min(0, "Carbs must be positive"),
  fats: z.coerce.number().min(0, "Fats must be positive"),
  serving_size: z.string().min(1, "Serving size is required"),
});

type FoodFormValues = z.infer<typeof foodSchema>;

interface CreateFoodDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  initialData?: Partial<FoodFormValues>;
  mealType?: string;
  logDate?: Date;
}

export const CreateFoodDialog = ({
  isOpen,
  onOpenChange,
  initialData,
  mealType,
  logDate,
}: CreateFoodDialogProps) => {
  const queryClient = useQueryClient();
  const form = useForm<FoodFormValues>({
    resolver: zodResolver(foodSchema),
    defaultValues: {
      name: "",
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      serving_size: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset({
        name: "",
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        serving_size: "",
      });
    }
  }, [initialData, form]);

  const onSubmit = async (values: FoodFormValues) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      showError("You must be logged in to create food.");
      return;
    }

    const { data: newFood, error } = await supabase
      .from("foods")
      .insert({ ...values, user_id: user.id })
      .select()
      .single();

    if (error || !newFood) {
      showError("Failed to create food.");
    } else {
      showSuccess("Food created successfully!");
      queryClient.invalidateQueries({ queryKey: ["foods"] });

      if (mealType && logDate) {
        const formattedDate = format(logDate, "yyyy-MM-dd");
        const { error: logError } = await supabase.from("meal_logs").insert({
          user_id: user.id,
          food_id: newFood.id,
          meal_type: mealType,
          log_date: formattedDate,
          quantity: 1,
        });

        if (logError) {
          showError(`Failed to log ${newFood.name}.`);
        } else {
          showSuccess(`${newFood.name} logged successfully!`);
          queryClient.invalidateQueries({ queryKey: ["mealLogs", formattedDate] });
        }
      }
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new food</DialogTitle>
          <DialogDescription>
            Add a custom food to your personal library.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Food Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Apple" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calories</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="serving_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serving Size</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1 medium" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="protein"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Protein (g)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="carbs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carbs (g)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fats"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fats (g)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save and Log Food"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
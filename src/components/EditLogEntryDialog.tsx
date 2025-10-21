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

const editLogSchema = z.object({
  quantity: z.coerce.number().min(0.1, "Quantity must be greater than 0"),
});

type EditLogFormValues = z.infer<typeof editLogSchema>;

interface EditLogEntryDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  logId: string;
  foodName: string;
  initialQuantity: number;
}

export const EditLogEntryDialog = ({
  isOpen,
  onOpenChange,
  logId,
  foodName,
  initialQuantity,
}: EditLogEntryDialogProps) => {
  const queryClient = useQueryClient();
  const form = useForm<EditLogFormValues>({
    resolver: zodResolver(editLogSchema),
    defaultValues: {
      quantity: initialQuantity,
    },
  });

  useEffect(() => {
    form.reset({ quantity: initialQuantity });
  }, [initialQuantity, form]);

  const onSubmit = async (values: EditLogFormValues) => {
    const { error } = await supabase
      .from("meal_logs")
      .update({ quantity: values.quantity })
      .eq("id", logId);

    if (error) {
      showError("Failed to update quantity.");
    } else {
      showSuccess("Quantity updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["foodLog"] });
      queryClient.invalidateQueries({ queryKey: ["mealLogs"] }); // Invalidate dashboard queries too
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Quantity</DialogTitle>
          <DialogDescription>
            Update the quantity for {foodName}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
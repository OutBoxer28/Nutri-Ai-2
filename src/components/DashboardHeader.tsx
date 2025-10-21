import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export const DashboardHeader = () => {
  const today = new Date();

  return (
    <header className="flex items-center justify-between">
      <Button variant="ghost" size="icon">
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Today</p>
        <h2 className="text-lg font-semibold">{format(today, "MMM dd, yyyy")}</h2>
      </div>
      <Button variant="ghost" size="icon">
        <ChevronRight className="h-6 w-6" />
      </Button>
    </header>
  );
};
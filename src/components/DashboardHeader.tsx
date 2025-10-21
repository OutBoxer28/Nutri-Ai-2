import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, isToday, isYesterday } from "date-fns";

interface DashboardHeaderProps {
  currentDate: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
}

export const DashboardHeader = ({ currentDate, onPrevDay, onNextDay }: DashboardHeaderProps) => {
  const getDayLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEEE");
  };

  return (
    <header className="flex items-center justify-between">
      <Button variant="ghost" size="icon" onClick={onPrevDay}>
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">{getDayLabel(currentDate)}</p>
        <h2 className="text-lg font-semibold">{format(currentDate, "MMM dd, yyyy")}</h2>
      </div>
      <Button variant="ghost" size="icon" onClick={onNextDay}>
        <ChevronRight className="h-6 w-6" />
      </Button>
    </header>
  );
};
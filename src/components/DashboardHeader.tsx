import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, isToday, isYesterday } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface DashboardHeaderProps {
  currentDate: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
  onDateChange: (date: Date) => void;
}

export const DashboardHeader = ({ currentDate, onPrevDay, onNextDay, onDateChange }: DashboardHeaderProps) => {
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
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="flex flex-col h-auto p-2">
            <span className="text-sm text-muted-foreground">{getDayLabel(currentDate)}</span>
            <span className="text-lg font-semibold flex items-center">
              {format(currentDate, "MMM dd, yyyy")}
              <CalendarIcon className="ml-2 h-4 w-4" />
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={currentDate}
            onSelect={(date) => date && onDateChange(date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Button variant="ghost" size="icon" onClick={onNextDay}>
        <ChevronRight className="h-6 w-6" />
      </Button>
    </header>
  );
};
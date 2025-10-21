import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DailySummaryCard } from "@/components/DailySummaryCard";
import { MealTimeline } from "@/components/MealTimeline";
import { WaterIntakeTracker } from "@/components/WaterIntakeTracker";
import { MicronutrientOverview } from "@/components/MicronutrientOverview";
import { QuickStats } from "@/components/QuickStats";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { add, sub } from "date-fns";

const Dashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevDay = () => {
    setCurrentDate((prevDate) => sub(prevDate, { days: 1 }));
  };

  const handleNextDay = () => {
    setCurrentDate((prevDate) => add(prevDate, { days: 1 }));
  };

  return (
    <div className="bg-background text-foreground font-sans">
      <div className="container mx-auto max-w-2xl p-4 md:p-6">
        <DashboardHeader 
          currentDate={currentDate}
          onPrevDay={handlePrevDay}
          onNextDay={handleNextDay}
        />
        <main className="grid gap-6 mt-6">
          <DailySummaryCard date={currentDate} />
          <QuickStats date={currentDate} />
          <MealTimeline date={currentDate} />
          <MicronutrientOverview />
          <WaterIntakeTracker />
        </main>
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Dashboard;
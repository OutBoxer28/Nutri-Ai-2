import { DashboardHeader } from "@/components/DashboardHeader";
import { DailySummaryCard } from "@/components/DailySummaryCard";
import { MealTimeline } from "@/components/MealTimeline";
import { WaterIntakeTracker } from "@/components/WaterIntakeTracker";
import { MicronutrientOverview } from "@/components/MicronutrientOverview";
import { QuickStats } from "@/components/QuickStats";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Dashboard = () => {
  return (
    <div className="bg-background text-foreground min-h-screen font-sans">
      <div className="container mx-auto max-w-2xl p-4 md:p-6">
        <DashboardHeader />
        <main className="grid gap-6 mt-6">
          <DailySummaryCard />
          <QuickStats />
          <MealTimeline />
          <MicronutrientOverview />
          <WaterIntakeTracker />
        </main>
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Dashboard;
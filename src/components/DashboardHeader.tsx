import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";

export const DashboardHeader = () => {
  const today = new Date();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError("There was an error logging out.");
    }
  };

  return (
    <header className="flex items-center justify-between">
      <Button variant="ghost" size="icon">
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Today</p>
        <h2 className="text-lg font-semibold">{format(today, "MMM dd, yyyy")}</h2>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <ChevronRight className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};
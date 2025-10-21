import { FoodLogList } from "@/components/FoodLogList";

const FoodLog = () => {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">Food Log</h1>
      <FoodLogList />
    </div>
  );
};

export default FoodLog;
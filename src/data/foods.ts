export type Food = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize: string;
};

export const mockFoodData: Food[] = [
  { id: '1', name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fats: 0.3, servingSize: '1 medium' },
  { id: '2', name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fats: 0.4, servingSize: '1 medium' },
  { id: '3', name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fats: 3.6, servingSize: '100g' },
  { id: '4', name: 'Brown Rice', calories: 111, protein: 2.6, carbs: 23, fats: 0.9, servingSize: '1 cup cooked' },
  { id: '5', name: 'Broccoli', calories: 55, protein: 3.7, carbs: 11, fats: 0.6, servingSize: '1 cup' },
  { id: '6', name: 'Salmon', calories: 206, protein: 22, carbs: 0, fats: 13, servingSize: '100g' },
  { id: '7', name: 'Almonds', calories: 164, protein: 6, carbs: 6, fats: 14, servingSize: '1/4 cup' },
  { id: '8', name: 'Egg', calories: 78, protein: 6, carbs: 0.6, fats: 5, servingSize: '1 large' },
];
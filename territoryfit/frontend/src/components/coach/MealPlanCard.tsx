import React from 'react';
import { Utensils } from 'lucide-react';

interface MealPlanCardProps {
  weightKg: number;
  age: number;
  goal: string;
}

function calculateDailyCalories(weightKg: number, age: number, goal: string): number {
  const bmr = 10 * weightKg + 6.25 * 170 - 5 * age + 5;
  const tdee = bmr * 1.55;
  if (goal === 'weight_loss') return Math.floor(tdee - 500);
  if (goal === 'muscle_gain') return Math.floor(tdee + 300);
  return Math.floor(tdee);
}

const MEAL_PLANS: Record<string, { breakfast: string; lunch: string; dinner: string; snack: string }> = {
  weight_loss: {
    breakfast: 'Greek yogurt with berries + black coffee',
    lunch: 'Grilled chicken salad with olive oil dressing',
    dinner: 'Baked salmon with steamed broccoli',
    snack: 'Apple + 10 almonds',
  },
  muscle_gain: {
    breakfast: 'Oatmeal with banana + 3 scrambled eggs',
    lunch: 'Brown rice + grilled chicken + avocado',
    dinner: 'Lean beef stir-fry with quinoa',
    snack: 'Protein shake + peanut butter toast',
  },
  endurance: {
    breakfast: 'Whole grain toast + eggs + orange juice',
    lunch: 'Pasta with tomato sauce + lean protein',
    dinner: 'Sweet potato + grilled fish + vegetables',
    snack: 'Banana + energy bar',
  },
  general_fitness: {
    breakfast: 'Smoothie bowl with granola + fruit',
    lunch: 'Quinoa bowl with mixed vegetables + tofu',
    dinner: 'Grilled chicken + roasted vegetables + rice',
    snack: 'Mixed nuts + dark chocolate',
  },
};

export function MealPlanCard({ weightKg, age, goal }: MealPlanCardProps) {
  const calories = calculateDailyCalories(weightKg, age, goal);
  const meals = MEAL_PLANS[goal] || MEAL_PLANS.general_fitness;

  const macros = goal === 'muscle_gain'
    ? { protein: 35, carbs: 45, fats: 20 }
    : goal === 'weight_loss'
    ? { protein: 40, carbs: 30, fats: 30 }
    : { protein: 30, carbs: 45, fats: 25 };

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Utensils className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-bold text-foreground uppercase tracking-wide">Meal Plan</span>
        </div>
        <span className="text-xs font-mono text-muted-foreground">{calories} kcal/day</span>
      </div>

      <div className="space-y-3 mb-4">
        {[
          { label: 'Breakfast', meal: meals.breakfast },
          { label: 'Lunch', meal: meals.lunch },
          { label: 'Dinner', meal: meals.dinner },
          { label: 'Snack', meal: meals.snack },
        ].map(({ label, meal }) => (
          <div key={label} className="flex gap-3">
            <span className="text-xs font-mono text-muted-foreground w-16 flex-shrink-0 pt-0.5">{label}</span>
            <span className="text-xs text-foreground">{meal}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-3">
        <div className="text-xs text-muted-foreground mb-2">Macro Split</div>
        <div className="flex gap-3">
          {[
            { label: 'Protein', value: macros.protein },
            { label: 'Carbs', value: macros.carbs },
            { label: 'Fats', value: macros.fats },
          ].map(({ label, value }) => (
            <div key={label} className="flex-1 text-center">
              <div className="text-sm font-bold font-mono text-foreground">{value}%</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

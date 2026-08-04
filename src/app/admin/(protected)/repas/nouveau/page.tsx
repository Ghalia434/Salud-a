import { MealForm } from "@/components/admin/meal-form";

export default function NewMealPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-800">Nouveau repas</h1>
      <div className="mt-8">
        <MealForm />
      </div>
    </div>
  );
}

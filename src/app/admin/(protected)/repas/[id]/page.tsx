import { MealForm } from "@/components/admin/meal-form";

export default async function EditMealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-800">Modifier le repas</h1>
      <div className="mt-8">
        <MealForm mealId={id} />
      </div>
    </div>
  );
}

import { ExtraForm } from "@/components/admin/extra-form";

export default async function EditExtraPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-800">Modifier le produit</h1>
      <div className="mt-8">
        <ExtraForm extraId={id} />
      </div>
    </div>
  );
}

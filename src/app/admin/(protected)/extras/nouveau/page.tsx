import { ExtraForm } from "@/components/admin/extra-form";

export default function NewExtraPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-800">Nouveau produit</h1>
      <div className="mt-8">
        <ExtraForm />
      </div>
    </div>
  );
}

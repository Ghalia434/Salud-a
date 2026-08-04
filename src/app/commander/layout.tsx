import Link from "next/link";
import { StepIndicator } from "@/components/step-indicator";

export default function CommanderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-brand-200 bg-brand-cream">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-brand-800">
            Saludèa
          </Link>
          <Link href="/" className="text-sm text-brand-600 hover:text-brand-800">
            Annuler la commande
          </Link>
        </div>
        <StepIndicator />
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}

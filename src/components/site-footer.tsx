import { WHATSAPP_NUMBER } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-brand-200 bg-brand-900 text-brand-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Saludèa — Meal Prep, vie équilibrée.</p>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-brand-300">
          <span>Livraison à Casablanca et Bouskoura</span>
          <span>Commandes du lundi au vendredi</span>
          <span>Livraison chaque lundi et jeudi</span>
          <a href={`https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}`} className="hover:text-white">
            {WHATSAPP_NUMBER}
          </a>
        </div>
      </div>
    </footer>
  );
}

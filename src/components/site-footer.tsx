import type { SVGProps } from "react";
import { WHATSAPP_NUMBER, INSTAGRAM_URL } from "@/lib/constants";

type IconProps = SVGProps<SVGSVGElement>;

function WhatsAppIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.06-1.33A10 10 0 1 0 12 2Zm0 18.2a8.16 8.16 0 0 1-4.17-1.14l-.3-.18-3 .79.8-2.92-.2-.3A8.19 8.19 0 1 1 12 20.2Zm4.49-6.14c-.24-.12-1.44-.71-1.67-.79s-.39-.12-.56.12-.64.79-.79.96-.29.18-.53.06a6.69 6.69 0 0 1-1.97-1.22 7.36 7.36 0 0 1-1.36-1.7c-.14-.24 0-.37.11-.49s.24-.29.36-.43a1.6 1.6 0 0 0 .24-.4.44.44 0 0 0 0-.42c-.06-.12-.56-1.36-.77-1.86s-.4-.43-.56-.43h-.48a.92.92 0 0 0-.67.31 2.8 2.8 0 0 0-.87 2.08 4.86 4.86 0 0 0 1.02 2.58 11.13 11.13 0 0 0 4.27 3.78 4.85 4.85 0 0 0 3 .63 2.56 2.56 0 0 0 1.68-1.18 2.08 2.08 0 0 0 .14-1.18c-.06-.11-.22-.17-.46-.29Z" />
    </svg>
  );
}

function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-brand-200 bg-brand-900 text-brand-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Saludèa — Meal Prep, vie équilibrée.</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-brand-300">
          <span>Livraison à Casablanca et Bouskoura</span>
          <span>Livraison chaque lundi et jeudi</span>
          <span>Fermé dimanche et mercredi</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            <InstagramIcon className="h-4 w-4" />
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import Image from "next/image";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-200 bg-brand-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.jpeg"
            alt="Saludèa"
            width={72}
            height={72}
            className="h-14 w-14 rounded-full object-cover"
            priority
          />
          <span className="sr-only">Saludèa</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-brand-700">
          <Link href="/#menu" className="hidden sm:inline hover:text-brand-900">
            Nos formules
          </Link>
          <Link
            href="/commander/objectif"
            className="rounded-full bg-brand-700 px-5 py-2 text-white shadow-sm transition hover:bg-brand-800"
          >
            Commander
          </Link>
        </nav>
      </div>
    </header>
  );
}

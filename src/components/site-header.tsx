import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: "client" | "admin" | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role ?? "client";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-brand-200 bg-brand-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold tracking-tight text-brand-800">
          Saludèa
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-brand-700">
          <Link href="/#menu" className="hidden sm:inline hover:text-brand-900">
            Nos formules
          </Link>
          {role === "admin" && (
            <Link href="/admin" className="hover:text-brand-900">
              Admin
            </Link>
          )}
          {user ? (
            <Link href="/compte" className="hover:text-brand-900">
              Mon compte
            </Link>
          ) : (
            <Link href="/connexion" className="hover:text-brand-900">
              Connexion
            </Link>
          )}
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

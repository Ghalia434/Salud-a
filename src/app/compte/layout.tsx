import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";

export default async function CompteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-brand-200 bg-brand-cream">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-brand-800">
            Saludèa
          </Link>
          <LogoutButton />
        </div>
        <nav className="mx-auto flex max-w-5xl gap-6 px-6 pb-4 text-sm font-medium text-brand-700">
          <Link href="/compte" className="hover:text-brand-900">
            Mes commandes
          </Link>
          <Link href="/compte/profil" className="hover:text-brand-900">
            Mon profil
          </Link>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}

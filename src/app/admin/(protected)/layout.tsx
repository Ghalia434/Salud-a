import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-full flex-col bg-brand-100">
      <header className="border-b border-brand-200 bg-brand-900 text-white print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="text-xl font-bold">
            Saludèa · Admin
          </Link>
          <LogoutButton redirectTo="/admin/login" />
        </div>
        <nav className="mx-auto flex max-w-6xl gap-6 px-6 pb-4 text-sm font-medium text-brand-200">
          <Link href="/admin" className="hover:text-white">
            Tableau de bord
          </Link>
          <Link href="/admin/repas" className="hover:text-white">
            Repas
          </Link>
          <Link href="/admin/extras" className="hover:text-white">
            Extras
          </Link>
          <Link href="/admin/commandes" className="hover:text-white">
            Commandes
          </Link>
          <Link href="/admin/clients" className="hover:text-white">
            Clients
          </Link>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}

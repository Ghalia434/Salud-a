import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeroBackground } from "@/components/hero-background";
import { OBJECTIVE_ICONS } from "@/components/objective-icons";
import { isOrderingOpen } from "@/lib/business-hours";
import { PROGRAMS, PROGRAM_ORDER, PROGRAM_STYLES } from "@/lib/constants";

const AUDIENCE = [
  { title: "Employés", text: "Des repas équilibrés même au bureau" },
  { title: "Sportifs", text: "Atteignez vos objectifs avec une nutrition adaptée" },
  { title: "Mamans & papas", text: "Des repas sains pour toute la famille, sans stress" },
  { title: "Étudiants", text: "Bien manger facilement, même avec un petit budget" },
];

export default function Home() {
  const open = isOrderingOpen();

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-brand-900 text-brand-100">
          <HeroBackground />
          <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 sm:py-28">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-300">
              Healthy Meal Prep
            </p>
            <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-tight sm:text-5xl">
              Meal Prep à partir de 3 plats. Frais, naturel, équilibré.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-brand-200">
              Des repas sains, faits maison et livrés chaque lundi et jeudi à
              Casablanca et Bouskoura. Choisissez votre objectif, composez vos
              repas, on s&apos;occupe du reste.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              {open ? (
                <Link
                  href="/commander/objectif"
                  className="rounded-full bg-brand-gold px-8 py-3 text-base font-semibold text-brand-900 shadow transition hover:brightness-95"
                >
                  Commander maintenant
                </Link>
              ) : (
                <div className="rounded-full bg-brand-800 px-8 py-3 text-base font-semibold text-brand-300">
                  Commandes fermées — réouverture lundi
                </div>
              )}
              <span className="text-sm text-brand-300">
                Paiement à la livraison uniquement
              </span>
            </div>
            <dl className="mt-14 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                ["Casa & Bouskoura", "Zones de livraison"],
                ["Lun–Ven", "Commandes ouvertes"],
                ["Lun & Jeu", "Livraison"],
                ["Min. 3", "Plats par commande"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="text-xl font-bold text-white">{value}</dt>
                  <dd className="text-sm text-brand-300">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="menu" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center font-display text-3xl font-bold text-brand-800">
            Choisissez votre objectif
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-brand-600">
            Chaque programme affiche uniquement les repas adaptés, avec calories et
            protéines par assiette.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROGRAM_ORDER.map((key) => {
              const program = PROGRAMS[key];
              const style = PROGRAM_STYLES[key];
              const Icon = OBJECTIVE_ICONS[key];
              return (
                <Link
                  key={key}
                  href="/commander/objectif"
                  className={`group flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${style.ring}`}
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full ${style.badgeBg} ${style.iconText}`}
                  >
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-brand-900">
                    {program.label}
                  </h3>
                  <p className="mt-2 text-sm text-brand-600">{program.description}</p>
                  <div className="mt-auto flex gap-4 pt-6 text-xs font-semibold text-brand-700">
                    <span>{program.calories} kcal</span>
                    <span>{program.protein} g protéines</span>
                  </div>
                  <span
                    className={`mt-6 text-sm font-semibold ${style.iconText} opacity-80 group-hover:opacity-100`}
                  >
                    Choisir ce programme →
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="bg-brand-100">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="text-center font-display text-2xl font-bold text-brand-800">
              Pour qui ?
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {AUDIENCE.map((a) => (
                <div key={a.title} className="text-center">
                  <h3 className="font-bold text-brand-800">{a.title}</h3>
                  <p className="mt-2 text-sm text-brand-600">{a.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-brand-900 text-brand-100">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 sm:grid-cols-[auto_1fr] sm:items-center">
            <Image
              src="/logo.jpeg"
              alt="Saludèa"
              width={200}
              height={200}
              className="mx-auto h-32 w-32 rounded-md sm:h-40 sm:w-40"
            />
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-brand-300">
                Notre histoire
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl">
                Deux sœurs, une même passion
              </h2>
              <div className="mt-6 space-y-4 text-brand-200">
                <p>
                  Saludèa, c&apos;est avant tout l&apos;histoire de deux sœurs réunies
                  autour d&apos;une même passion : prendre soin de soi à travers une
                  alimentation saine et gourmande.
                </p>
                <p>
                  Tout a commencé par une envie simple : créer une solution qui
                  facilite le quotidien en proposant des repas équilibrés, préparés
                  avec amour, sans compromis sur le goût ni la qualité.
                </p>
                <p>
                  À travers Saludèa, nous avons souhaité partager notre vision d&apos;une
                  alimentation plus consciente : des plats pensés pour accompagner
                  chaque objectif, tout en gardant le plaisir de bien manger.
                </p>
                <p>
                  Plus qu&apos;un service de meal prep, Saludèa est une aventure née
                  d&apos;une complicité entre deux sœurs et d&apos;une volonté de
                  transmettre un mode de vie sain, savoureux et équilibré.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

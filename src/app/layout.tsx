import type { Metadata } from "next";
import { Lato, Playfair_Display } from "next/font/google";
import { DELIVERY_CITIES, WHATSAPP_NUMBER, INSTAGRAM_URL } from "@/lib/constants";
import "./globals.css";

const SITE_URL = "https://www.saludea.ma";
const SITE_TITLE = "Saludèa — Meal Prep Healthy Food à Casablanca";
const SITE_DESCRIPTION =
  "Repas frais, naturels et équilibrés, livrés chaque lundi et jeudi à Casablanca et Bouskoura. Meal prep sur-mesure : perte de poids, prise de masse, équilibre, transformation corporelle, Formule Athlète.";

const LOCAL_BUSINESS_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  name: "Saludèa",
  url: SITE_URL,
  image: `${SITE_URL}/logo.jpeg`,
  telephone: WHATSAPP_NUMBER,
  servesCuisine: "Healthy, Meal Prep",
  areaServed: DELIVERY_CITIES.map((c) => c.label),
  address: {
    "@type": "PostalAddress",
    addressLocality: "Casablanca",
    addressCountry: "MA",
  },
  sameAs: [INSTAGRAM_URL],
};

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | Saludèa",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "meal prep Casablanca",
    "repas équilibrés Casablanca",
    "livraison repas sains Maroc",
    "meal prep Maroc",
    "programme nutritionnel Casablanca",
    "repas sains Bouskoura",
    "perte de poids repas livrés",
  ],
  authors: [{ name: "Saludèa" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_MA",
    url: SITE_URL,
    siteName: "Saludèa",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: "/logo.jpeg", width: 800, height: 800, alt: "Saludèa" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/logo.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${lato.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-brand-cream text-brand-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_JSON_LD) }}
        />
        {children}
      </body>
    </html>
  );
}


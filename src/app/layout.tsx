import type { Metadata } from "next";
import { Lato, Playfair_Display } from "next/font/google";
import "./globals.css";

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
  title: "Saludèa — Meal Prep Healthy Food",
  description:
    "Repas frais, naturels et équilibrés, livrés chaque lundi et jeudi à Casablanca et Bouskoura. Commandez votre meal prep dès maintenant.",
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
        {children}
      </body>
    </html>
  );
}

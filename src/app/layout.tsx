import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Saludèa — Meal Prep Healthy Food",
  description:
    "Repas frais, naturels et équilibrés, livrés chaque dimanche à Casablanca. Commandez votre meal prep dès maintenant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-brand-cream text-brand-900">
        {children}
      </body>
    </html>
  );
}

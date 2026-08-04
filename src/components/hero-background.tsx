"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const IMAGES = [
  "/meals/riz-noir-poulet.jpeg",
  "/meals/salade-exotique.jpeg",
  "/meals/lentilles-crevettes.jpeg",
  "/meals/ble-poulet.jpeg",
  "/meals/pates-saumon.jpeg",
  "/meals/puree-navet-chevre.jpeg",
  "/meals/patate-douce-steak.jpeg",
  "/meals/mousseline-boulettes.jpeg",
];

const INTERVAL_MS = 4500;

export function HeroBackground() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % IMAGES.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {IMAGES.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out"
          style={{ opacity: i === index ? 1 : 0 }}
        >
          <Image
            src={src}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="animate-hero-zoom object-cover"
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-900/70 via-brand-900/45 to-brand-900/80" />
    </div>
  );
}

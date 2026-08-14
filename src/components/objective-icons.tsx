import type { SVGProps } from "react";
import type { ProgramType } from "@/lib/database.types";

type IconProps = SVGProps<SVGSVGElement>;

// Every icon uses currentColor for its main shape (inherits the objective's
// accent color from the wrapper) plus this fixed brand gold for small
// decorative details, tying all four back to the logo.
const GOLD = "#c8a96a";

function PerteDePoidsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <circle cx="24" cy="10" r="5" fill="currentColor" />
      <path d="M16 17h16l-4 11 4 11H16l4-11z" fill="currentColor" fillOpacity="0.9" />
      <path
        d="M4 24h10M10 20l4 4-4 4"
        stroke={GOLD}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M44 24H34M38 20l-4 4 4 4"
        stroke={GOLD}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EquilibreIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <rect x="22" y="10" width="4" height="26" rx="2" fill="currentColor" />
      <rect x="8" y="14" width="32" height="4" rx="2" fill="currentColor" />
      <path
        d="M12 18L4 20M12 18l8 2M36 18l-8 2M36 18l8 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M4 20q8 10 16 0z" fill="currentColor" fillOpacity="0.85" />
      <path d="M28 20q8 10 16 0z" fill="currentColor" fillOpacity="0.85" />
      <rect x="14" y="36" width="20" height="4" rx="2" fill="currentColor" />
      <path d="M24 3c-3 0-4 3 0 6 4-3 3-6 0-6z" fill={GOLD} />
    </svg>
  );
}

function PriseDeMasseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <rect x="6" y="14" width="8" height="20" rx="3" fill="currentColor" />
      <rect x="34" y="14" width="8" height="20" rx="3" fill="currentColor" />
      <rect x="13" y="21" width="22" height="6" rx="2" fill="currentColor" fillOpacity="0.9" />
      <path
        d="M24 4l1.4 3.6L29 9l-3.6 1.4L24 14l-1.4-3.6L19 9l3.6-1.4z"
        fill={GOLD}
      />
    </svg>
  );
}

function TransformationIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <circle cx="24" cy="10" r="5" fill="currentColor" />
      <path
        d="M24 15v11M24 18L12 10M24 18l12-8M24 26L14 40M24 26l10 14"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 6l6 3M44 6l-6 3M4 40l6-3M44 40l-6-3"
        stroke={GOLD}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const OBJECTIVE_ICONS: Record<
  ProgramType,
  (props: IconProps) => React.JSX.Element
> = {
  perte_de_poids: PerteDePoidsIcon,
  equilibre: EquilibreIcon,
  prise_de_masse: PriseDeMasseIcon,
  transformation_corporelle: TransformationIcon,
};

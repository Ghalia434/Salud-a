"use client";

export function PrintReceiptButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-full border border-brand-300 px-4 py-2 text-sm font-semibold text-brand-700"
    >
      Imprimer le reçu
    </button>
  );
}

import { ORDER_STATUS_LABELS } from "@/lib/constants";
import type { OrderStatus } from "@/lib/database.types";

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, className } = ORDER_STATUS_LABELS[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
}

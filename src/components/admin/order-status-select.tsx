"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ORDER_STATUS_LABELS, ORDER_STATUS_FLOW } from "@/lib/constants";
import type { OrderStatus } from "@/lib/database.types";

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [saving, setSaving] = useState(false);

  async function update(next: OrderStatus) {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status: next })
      .eq("id", orderId);
    setSaving(false);
    if (!error) {
      setCurrent(next);
      router.refresh();
    }
  }

  return (
    <select
      value={current}
      disabled={saving}
      onChange={(e) => update(e.target.value as OrderStatus)}
      className="rounded-full border border-brand-300 px-4 py-2 text-sm font-semibold text-brand-700"
    >
      {ORDER_STATUS_FLOW.map((s) => (
        <option key={s} value={s}>
          {ORDER_STATUS_LABELS[s].label}
        </option>
      ))}
    </select>
  );
}

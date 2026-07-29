"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const statuses = [
  { value: "new", label: "New", color: "bg-blue-100 text-blue-700" },
  { value: "contacted", label: "Contacted", color: "bg-amber-100 text-amber-700" },
  { value: "qualified", label: "Qualified", color: "bg-green-100 text-green-700" },
  { value: "closed", label: "Closed", color: "bg-slate-100 text-slate-700" },
  { value: "lost", label: "Lost", color: "bg-red-100 text-red-700" },
];

export function LeadStatusSelect({
  leadId,
  currentStatus,
}: {
  leadId: number;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const current = statuses.find((s) => s.value === status) ?? statuses[0];

  async function updateStatus(newStatus: string) {
    if (newStatus === status) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative inline-block">
      <select
        value={status}
        onChange={(e) => updateStatus(e.target.value)}
        disabled={loading}
        className={cn(
          "appearance-none pl-2.5 pr-7 py-1 text-xs font-semibold rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500",
          current.color,
          loading && "opacity-50"
        )}
      >
        {statuses.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      {loading && (
        <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin" />
      )}
    </div>
  );
}

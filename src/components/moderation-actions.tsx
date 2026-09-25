"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, EyeOff } from "lucide-react";

/** Admin approve / reject / unpublish actions for a single property. */
export function ModerationActions({
  propertyId,
  status,
  isActive,
  compact = false,
}: {
  propertyId: number;
  status: string;
  isActive: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"" | "approve" | "reject" | "unpublish">(
    ""
  );
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  async function act(
    action: "approve" | "reject" | "unpublish",
    rejectionReason?: string
  ) {
    setLoading(action);
    setError("");
    try {
      const res = await fetch(`/api/admin/properties/${propertyId}/moderation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, rejectionReason }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Action failed");
      }
      setRejecting(false);
      setReason("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setLoading("");
    }
  }

  if (rejecting) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 w-full sm:w-72">
        <label className="block text-xs font-semibold text-red-800 mb-1">
          Rejection reason (shown to the seller)
        </label>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. RERA details required."
          className="w-full px-2.5 py-2 rounded-md border border-red-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        />
        {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            disabled={loading === "reject"}
            onClick={() => void act("reject", reason)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-60"
          >
            {loading === "reject" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Confirm reject
          </button>
          <button
            type="button"
            onClick={() => {
              setRejecting(false);
              setError("");
            }}
            className="px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-white"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status !== "approved" || !isActive ? (
        <button
          type="button"
          disabled={loading !== ""}
          onClick={() => void act("approve")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-60"
        >
          {loading === "approve" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" />
          )}
          Approve
        </button>
      ) : (
        <button
          type="button"
          disabled={loading !== ""}
          onClick={() => {
            if (confirm("Hide this property from the public website?")) {
              void act("unpublish");
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-60"
        >
          <EyeOff className="h-3.5 w-3.5" />
          Unpublish
        </button>
      )}

      <button
        type="button"
        disabled={loading !== ""}
        onClick={() => setRejecting(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-60"
      >
        <XCircle className="h-3.5 w-3.5" />
        {compact ? "Reject" : "Reject"}
      </button>
      {error && <span className="text-xs text-red-700">{error}</span>}
    </div>
  );
}

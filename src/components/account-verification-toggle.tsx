"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, ShieldOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Admin control to verify / unverify and activate / deactivate an account. */
export function AccountVerificationToggle({
  accountId,
  isVerified,
  isActive,
}: {
  accountId: number;
  isVerified: boolean;
  isActive: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"" | "verify" | "active">("");
  const [state, setState] = useState({ isVerified, isActive });

  async function patch(body: Record<string, boolean>, key: "verify" | "active") {
    setLoading(key);
    try {
      const res = await fetch(`/api/admin/users/${accountId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Update failed");
      }
      setState({
        isVerified: json.isVerified ?? state.isVerified,
        isActive: json.isActive ?? state.isActive,
      });
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading("");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={loading !== ""}
        onClick={() => void patch({ isVerified: !state.isVerified }, "verify")}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold disabled:opacity-60",
          state.isVerified
            ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
            : "bg-green-600 text-white hover:bg-green-700"
        )}
      >
        {loading === "verify" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : state.isVerified ? (
          <ShieldOff className="h-3.5 w-3.5" />
        ) : (
          <BadgeCheck className="h-3.5 w-3.5" />
        )}
        {state.isVerified ? "Unverify" : "Verify"}
      </button>

      <button
        type="button"
        disabled={loading !== ""}
        onClick={() => void patch({ isActive: !state.isActive }, "active")}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border disabled:opacity-60",
          state.isActive
            ? "border-slate-300 text-slate-700 hover:bg-slate-50"
            : "border-green-300 text-green-700 hover:bg-green-50"
        )}
      >
        {loading === "active" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {state.isActive ? "Deactivate" : "Activate"}
      </button>
    </div>
  );
}

import { permanentRedirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard | Vizag Properties",
  robots: { index: false, follow: false },
};

/**
 * The builder dashboard moved to /dashboard/seller, which is shared by
 * builders, property owners and real-estate agents.
 *
 * Every old /dashboard/builder/** URL is redirected (308) to its
 * /dashboard/seller/** equivalent so existing bookmarks keep working.
 */
export default async function BuilderDashboardRedirect({
  params,
}: {
  params: Promise<{ rest?: string[] }>;
}) {
  const { rest } = await params;
  const suffix = (rest ?? []).filter(Boolean).join("/");
  permanentRedirect(`/dashboard/seller${suffix ? `/${suffix}` : ""}`);
}

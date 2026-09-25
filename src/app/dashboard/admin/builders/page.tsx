import { permanentRedirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Users & Verification | Admin | Vizag Properties",
  robots: { index: false, follow: false },
};

/**
 * Old "Builders" screen — accounts of every type (builder / owner / agent) are
 * now managed on /dashboard/admin/users.
 */
export default async function AdminBuildersRedirect() {
  permanentRedirect("/dashboard/admin/users");
}

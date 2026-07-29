import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { builders } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  DashboardShell,
  builderNavItems,
} from "@/components/dashboard-shell";
import { BuilderProfileForm } from "@/components/builder-profile-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Profile | Vizag Properties",
  robots: { index: false, follow: false },
};

export default async function BuilderProfilePage() {
  const session = await getSession();
  if (!session || session.role !== "builder") {
    redirect("/login/builder");
  }

  const [builder] = await db
    .select()
    .from(builders)
    .where(eq(builders.id, session.id))
    .limit(1);

  if (!builder) redirect("/login/builder");

  return (
    <DashboardShell
      title="Builder Dashboard"
      user={{ name: session.name, email: session.email, role: "Builder" }}
      navItems={builderNavItems}
    >
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Profile Settings
        </h1>
        <p className="mt-1 text-slate-600">
          Update your builder profile information.
        </p>
      </div>
      <BuilderProfileForm
        initial={{
          name: builder.name,
          phone: builder.phone,
          description: builder.description ?? "",
          website: builder.website ?? "",
          address: builder.address ?? "",
          experienceYears: builder.experienceYears ?? 0,
          projectsCount: builder.projectsCount ?? 0,
        }}
      />
    </DashboardShell>
  );
}

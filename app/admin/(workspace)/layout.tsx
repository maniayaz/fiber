import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AdminShell } from "@/components/admin-shell";
import { hasAdminAllowlist, isAdminEmail } from "@/lib/admin-auth";
import { getSupabaseConfiguration } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminWorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  await connection();

  const configuration = getSupabaseConfiguration();
  if (!configuration.configured || !hasAdminAllowlist()) {
    redirect("/admin/login");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    throw new Error(`Could not verify the admin session: ${error.message}`);
  }
  if (!data.user || !isAdminEmail(data.user.email)) {
    redirect("/admin/login");
  }

  return <AdminShell>{children}</AdminShell>;
}

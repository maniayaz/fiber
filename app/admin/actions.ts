"use server";

import { redirect } from "next/navigation";
import { hasAdminAllowlist, isAdminEmail } from "@/lib/admin-auth";
import { getSupabaseConfiguration } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminAuthState = { error: string } | null;

export async function signInAdmin(
  _previousState: AdminAuthState,
  formData: FormData,
): Promise<AdminAuthState> {
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");
  if (
    typeof emailValue !== "string" ||
    typeof passwordValue !== "string" ||
    !emailValue.trim() ||
    !passwordValue
  ) {
    return { error: "Enter your admin email and password." };
  }

  if (!getSupabaseConfiguration().configured) {
    return { error: "Supabase authentication is not configured yet." };
  }
  if (!hasAdminAllowlist()) {
    return { error: "No admin email accounts have been configured yet." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailValue.trim(),
    password: passwordValue,
  });

  if (error || !data.user) {
    return { error: "The email or password is incorrect." };
  }

  if (!isAdminEmail(data.user.email)) {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      throw new Error(`Could not clear the unauthorized session: ${signOutError.message}`);
    }
    return { error: "This account is not authorized for the admin workspace." };
  }

  redirect("/admin");
}

export async function signOutAdmin() {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(`Could not sign out of the admin workspace: ${error.message}`);
  }

  redirect("/admin/login");
}

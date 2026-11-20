import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { connection } from "next/server";
import { AdminLoginForm } from "@/components/admin-login-form";
import { hasAdminAllowlist } from "@/lib/admin-auth";
import { getSupabaseConfiguration } from "@/lib/supabase/config";

export default async function AdminLoginPage() {
  await connection();

  const supabaseConfigured = getSupabaseConfiguration().configured;
  const adminAllowlistConfigured = hasAdminAllowlist();

  return (
    <main className="admin-auth-wrap">
      <section className="admin-panel admin-auth-card">
        <span className="auth-icon"><LockKeyhole size={21} /></span>
        <span className="section-kicker">ADMIN ACCESS</span>
        <h1>Admin sign-in</h1>
        <p>Sign in with an authorized Fiber Link admin account.</p>
        {supabaseConfigured && adminAllowlistConfigured ? (
          <AdminLoginForm />
        ) : (
          <div className="auth-notice">
            Admin sign-in needs {[
              !supabaseConfigured && "Supabase URL and publishable key",
              !adminAllowlistConfigured && "an ADMIN_EMAILS allowlist",
            ].filter(Boolean).join(" and ")} configured in the server environment.
          </div>
        )}
        <Link className="auth-secondary" href="/">Return to Fiber Link</Link>
      </section>
    </main>
  );
}

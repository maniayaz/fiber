"use client";

import { useActionState } from "react";
import { signInAdmin } from "@/app/admin/actions";

export function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(signInAdmin, null);

  return (
    <form action={formAction} className="admin-login-form">
      <label>
        Admin email
        <input autoComplete="username" name="email" required type="email" />
      </label>
      <label>
        Password
        <input autoComplete="current-password" name="password" required type="password" />
      </label>
      {state?.error && <p className="admin-login-error" role="alert">{state.error}</p>}
      <button className="button auth-button" disabled={isPending} type="submit">
        {isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

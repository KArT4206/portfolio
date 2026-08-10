"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Lock } from "lucide-react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
    >
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8">
      <div className="flex items-center gap-2 text-accent">
        <Lock size={18} />
        <span className="text-sm font-medium">Admin Access</span>
      </div>
      <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">Sign in</h1>

      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="username" className="text-xs font-medium text-muted">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            className="rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent/50"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-xs font-medium text-muted">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent/50"
          />
        </div>
      </div>

      {state.error && (
        <p className="mt-4 flex items-start gap-2 text-sm text-red-400">
          <AlertCircle size={15} className="mt-0.5 shrink-0" /> {state.error}
        </p>
      )}

      <div className="mt-6">
        <SubmitButton />
      </div>
    </form>
  );
}

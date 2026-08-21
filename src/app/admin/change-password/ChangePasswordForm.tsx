"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, ShieldAlert, Lock } from "lucide-react";
import { changePasswordAction, type ChangePasswordState } from "./actions";

const initialState: ChangePasswordState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
    >
      {pending ? "Updating..." : "Update password"}
    </button>
  );
}

export default function ChangePasswordForm({ forced }: { forced: boolean }) {
  const [state, formAction] = useActionState(changePasswordAction, initialState);

  return (
    <form action={formAction} className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8">
      <div className="flex items-center gap-2 text-accent">
        {forced ? <ShieldAlert size={18} /> : <Lock size={18} />}
        <span className="text-sm font-medium">{forced ? "Password Change Required" : "Change Password"}</span>
      </div>
      <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">
        {forced ? "Set a new password" : "Update your password"}
      </h1>
      {forced && (
        <p className="mt-2 text-sm text-muted">
          You&apos;re signed in with a temporary password. Choose a new one to continue — this is required
          before you can use the rest of Admin.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="currentPassword" className="text-xs font-medium text-muted">
            Current password
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            className="rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent/50"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="newPassword" className="text-xs font-medium text-muted">
            New password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={10}
            required
            className="rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent/50"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="confirmPassword" className="text-xs font-medium text-muted">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={10}
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

"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { saveProfileAction, type SaveProfileState } from "./actions";

export type ProfileFormInitialValues = {
  name: string;
  initials: string;
  tagline: string;
  location: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  summary: string;
  heroLine1: string;
  heroLine2: string;
  heroLine3: string;
  profileImageUrl?: string | null;
};

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-xs font-medium text-muted">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

const inputClass =
  "rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent/50";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
    >
      {pending ? "Saving..." : "Save Profile"}
    </button>
  );
}

export default function ProfileForm({ initial }: { initial: ProfileFormInitialValues }) {
  const initialState: SaveProfileState = { error: null };
  const [state, formAction] = useActionState(saveProfileAction, initialState);
  const fieldErrors = state.fieldErrors ?? {};
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (state.error === null && Object.keys(fieldErrors).length === 0 && state !== initialState) {
      // Reacting to a Server Action's result after it lands — a legitimate
      // "sync with an external system" effect, not state derivable at
      // render time, so the direct setState here is intentional.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSaved(true);
      const t = setTimeout(() => setSaved(false), 3000);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.error && (
        <p className="flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle size={15} /> {state.error}
        </p>
      )}
      {saved && (
        <p className="flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-400">
          <CheckCircle2 size={15} /> Profile saved.
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="name" error={fieldErrors.name}>
          <input id="name" name="name" defaultValue={initial.name} required className={inputClass} />
        </Field>
        <Field label="Initials" htmlFor="initials" error={fieldErrors.initials}>
          <input id="initials" name="initials" defaultValue={initial.initials} required className={inputClass} />
        </Field>
      </div>

      <Field label="Tagline" htmlFor="tagline" error={fieldErrors.tagline}>
        <input id="tagline" name="tagline" defaultValue={initial.tagline} required className={inputClass} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Location" htmlFor="location" error={fieldErrors.location}>
          <input id="location" name="location" defaultValue={initial.location} required className={inputClass} />
        </Field>
        <Field label="Email" htmlFor="email" error={fieldErrors.email}>
          <input id="email" name="email" type="email" defaultValue={initial.email} required className={inputClass} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="GitHub URL" htmlFor="githubUrl" error={fieldErrors.githubUrl}>
          <input id="githubUrl" name="githubUrl" type="url" defaultValue={initial.githubUrl} required className={inputClass} />
        </Field>
        <Field label="LinkedIn URL" htmlFor="linkedinUrl" error={fieldErrors.linkedinUrl}>
          <input id="linkedinUrl" name="linkedinUrl" type="url" defaultValue={initial.linkedinUrl} required className={inputClass} />
        </Field>
      </div>

      <Field label="Summary" htmlFor="summary" error={fieldErrors.summary}>
        <textarea id="summary" name="summary" defaultValue={initial.summary} rows={5} required className={inputClass} />
      </Field>

      <div>
        <p className="text-xs font-medium text-muted">Hero Lines (up to 3, rendered in sequence on the homepage)</p>
        <div className="mt-2 flex flex-col gap-2">
          <input id="heroLine1" name="heroLine1" defaultValue={initial.heroLine1} className={inputClass} placeholder="Line 1" />
          <input id="heroLine2" name="heroLine2" defaultValue={initial.heroLine2} className={inputClass} placeholder="Line 2 (highlighted)" />
          <input id="heroLine3" name="heroLine3" defaultValue={initial.heroLine3} className={inputClass} placeholder="Line 3" />
        </div>
      </div>

      <Field label="Profile Image (optional)" htmlFor="profileImage" error={fieldErrors.profileImage}>
        {initial.profileImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={initial.profileImageUrl}
            alt="Current profile"
            className="mb-2 h-24 w-24 rounded-full border border-border object-cover"
          />
        )}
        <input
          id="profileImage"
          name="profileImage"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-xs file:text-foreground"
        />
      </Field>

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}

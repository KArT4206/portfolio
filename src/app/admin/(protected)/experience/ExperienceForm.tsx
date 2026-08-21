"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle } from "lucide-react";
import { saveExperienceAction, type SaveExperienceState } from "./actions";

export type ExperienceFormInitialValues = {
  org: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string;
  published: boolean;
};

const EMPTY_VALUES: ExperienceFormInitialValues = {
  org: "",
  role: "",
  location: "",
  startDate: "",
  endDate: "",
  bullets: "",
  published: false,
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

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

export default function ExperienceForm({
  experienceId,
  initial = EMPTY_VALUES,
  submitLabel,
}: {
  experienceId: string | null;
  initial?: ExperienceFormInitialValues;
  submitLabel: string;
}) {
  const boundAction = saveExperienceAction.bind(null, experienceId);
  const initialState: SaveExperienceState = { error: null };
  const [state, formAction] = useActionState(boundAction, initialState);
  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.error && (
        <p className="flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle size={15} /> {state.error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Organization" htmlFor="org" error={fieldErrors.org}>
          <input id="org" name="org" defaultValue={initial.org} required className={inputClass} />
        </Field>
        <Field label="Role" htmlFor="role" error={fieldErrors.role}>
          <input id="role" name="role" defaultValue={initial.role} required className={inputClass} />
        </Field>
      </div>

      <Field label="Location" htmlFor="location" error={fieldErrors.location}>
        <input id="location" name="location" defaultValue={initial.location} className={inputClass} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Start Date" htmlFor="startDate" error={fieldErrors.startDate}>
          <input id="startDate" name="startDate" type="date" defaultValue={initial.startDate} className={inputClass} />
        </Field>
        <Field label="End Date (leave blank for Present)" htmlFor="endDate" error={fieldErrors.endDate}>
          <input id="endDate" name="endDate" type="date" defaultValue={initial.endDate} className={inputClass} />
        </Field>
      </div>

      <Field label="Bullets (one per line)" htmlFor="bullets" error={fieldErrors.bullets}>
        <textarea id="bullets" name="bullets" defaultValue={initial.bullets} rows={6} className={inputClass} />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" defaultChecked={initial.published} className="h-4 w-4 accent-accent" />
        Published (visible on the public site)
      </label>

      <div>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}

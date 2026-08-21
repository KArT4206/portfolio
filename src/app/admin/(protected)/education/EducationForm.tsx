"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle } from "lucide-react";
import { saveEducationAction, type SaveEducationState } from "./actions";

export type EducationFormInitialValues = {
  school: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  coursework: string;
  published: boolean;
};

const EMPTY_VALUES: EducationFormInitialValues = {
  school: "",
  degree: "",
  location: "",
  startDate: "",
  endDate: "",
  coursework: "",
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

export default function EducationForm({
  educationId,
  initial = EMPTY_VALUES,
  submitLabel,
}: {
  educationId: string | null;
  initial?: EducationFormInitialValues;
  submitLabel: string;
}) {
  const boundAction = saveEducationAction.bind(null, educationId);
  const initialState: SaveEducationState = { error: null };
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
        <Field label="School" htmlFor="school" error={fieldErrors.school}>
          <input id="school" name="school" defaultValue={initial.school} required className={inputClass} />
        </Field>
        <Field label="Degree" htmlFor="degree" error={fieldErrors.degree}>
          <input id="degree" name="degree" defaultValue={initial.degree} required className={inputClass} />
        </Field>
      </div>

      <Field label="Location" htmlFor="location" error={fieldErrors.location}>
        <input id="location" name="location" defaultValue={initial.location} className={inputClass} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Start Date" htmlFor="startDate" error={fieldErrors.startDate}>
          <input id="startDate" name="startDate" type="date" defaultValue={initial.startDate} className={inputClass} />
        </Field>
        <Field label="End Date (leave blank for ongoing/expected)" htmlFor="endDate" error={fieldErrors.endDate}>
          <input id="endDate" name="endDate" type="date" defaultValue={initial.endDate} className={inputClass} />
        </Field>
      </div>

      <Field label="Coursework (comma-separated)" htmlFor="coursework" error={fieldErrors.coursework}>
        <textarea id="coursework" name="coursework" defaultValue={initial.coursework} rows={3} className={inputClass} />
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

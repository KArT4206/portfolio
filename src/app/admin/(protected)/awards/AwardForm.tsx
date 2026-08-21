"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle } from "lucide-react";
import { saveAwardAction, type SaveAwardState } from "./actions";

export type AwardFormInitialValues = {
  title: string;
  organization: string;
  detail: string;
  year: string;
  certificateUrl: string;
  featured: boolean;
  published: boolean;
  certificateFileUrl?: string | null;
};

const EMPTY_VALUES: AwardFormInitialValues = {
  title: "",
  organization: "",
  detail: "",
  year: "",
  certificateUrl: "",
  featured: false,
  published: false,
  certificateFileUrl: null,
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

export default function AwardForm({
  awardId,
  initial = EMPTY_VALUES,
  submitLabel,
}: {
  awardId: string | null;
  initial?: AwardFormInitialValues;
  submitLabel: string;
}) {
  const boundAction = saveAwardAction.bind(null, awardId);
  const initialState: SaveAwardState = { error: null };
  const [state, formAction] = useActionState(boundAction, initialState);
  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.error && (
        <p className="flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle size={15} /> {state.error}
        </p>
      )}

      <Field label="Title" htmlFor="title" error={fieldErrors.title}>
        <input id="title" name="title" defaultValue={initial.title} required className={inputClass} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Organization / Conference" htmlFor="organization" error={fieldErrors.organization}>
          <input id="organization" name="organization" defaultValue={initial.organization} className={inputClass} />
        </Field>
        <Field label="Year" htmlFor="year" error={fieldErrors.year}>
          <input id="year" name="year" type="number" defaultValue={initial.year} className={inputClass} placeholder="2026" />
        </Field>
      </div>

      <Field label="Detail" htmlFor="detail" error={fieldErrors.detail}>
        <textarea id="detail" name="detail" defaultValue={initial.detail} rows={4} className={inputClass} />
      </Field>

      <Field label="Certificate URL (external link, optional)" htmlFor="certificateUrl" error={fieldErrors.certificateUrl}>
        <input
          id="certificateUrl"
          name="certificateUrl"
          type="url"
          defaultValue={initial.certificateUrl}
          className={inputClass}
        />
      </Field>

      <Field label="Certificate File (upload, optional)" htmlFor="certificateFile" error={fieldErrors.certificateFile}>
        {initial.certificateFileUrl && (
          <p className="text-xs text-muted">
            Current file:{" "}
            <a href={initial.certificateFileUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">
              view
            </a>
          </p>
        )}
        <input
          id="certificateFile"
          name="certificateFile"
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/webp"
          className="text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-xs file:text-foreground"
        />
        <p className="text-xs text-muted">
          The public site only shows a &quot;View Certificate&quot; action once a URL or file is actually set here.
        </p>
      </Field>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={initial.featured} className="h-4 w-4 accent-accent" />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" defaultChecked={initial.published} className="h-4 w-4 accent-accent" />
          Published (visible on the public site)
        </label>
      </div>

      <div>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}

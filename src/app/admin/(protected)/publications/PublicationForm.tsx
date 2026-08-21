"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle } from "lucide-react";
import { savePublicationAction, type SavePublicationState } from "./actions";
import { PUBLICATION_STATUSES } from "@/lib/validation/publication";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  ACCEPTED: "Accepted",
  PUBLISHED: "Published",
};

export type PublicationFormInitialValues = {
  title: string;
  authors: string;
  journal: string;
  publicationDate: string;
  doi: string;
  url: string;
  status: string;
  abstract: string;
  keywords: string;
  featured: boolean;
  published: boolean;
};

const EMPTY_VALUES: PublicationFormInitialValues = {
  title: "",
  authors: "",
  journal: "",
  publicationDate: "",
  doi: "",
  url: "",
  status: "DRAFT",
  abstract: "",
  keywords: "",
  featured: false,
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

export default function PublicationForm({
  publicationId,
  initial = EMPTY_VALUES,
  submitLabel,
}: {
  publicationId: string | null;
  initial?: PublicationFormInitialValues;
  submitLabel: string;
}) {
  const boundAction = savePublicationAction.bind(null, publicationId);
  const initialState: SavePublicationState = { error: null };
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
        <Field label="Authors (comma-separated)" htmlFor="authors" error={fieldErrors.authors}>
          <input id="authors" name="authors" defaultValue={initial.authors} className={inputClass} placeholder="Karthik B, ..." />
        </Field>
        <Field label="Journal / Conference" htmlFor="journal" error={fieldErrors.journal}>
          <input id="journal" name="journal" defaultValue={initial.journal} className={inputClass} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Publication Date" htmlFor="publicationDate" error={fieldErrors.publicationDate}>
          <input
            id="publicationDate"
            name="publicationDate"
            type="date"
            defaultValue={initial.publicationDate}
            className={inputClass}
          />
        </Field>
        <Field label="Status" htmlFor="status" error={fieldErrors.status}>
          <select id="status" name="status" defaultValue={initial.status} className={inputClass}>
            {PUBLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="DOI" htmlFor="doi" error={fieldErrors.doi}>
          <input id="doi" name="doi" defaultValue={initial.doi} className={inputClass} />
        </Field>
      </div>

      <Field label="URL" htmlFor="url" error={fieldErrors.url}>
        <input id="url" name="url" type="url" defaultValue={initial.url} className={inputClass} />
      </Field>

      <Field label="Abstract" htmlFor="abstract" error={fieldErrors.abstract}>
        <textarea id="abstract" name="abstract" defaultValue={initial.abstract} rows={5} className={inputClass} />
      </Field>

      <Field label="Keywords (comma-separated)" htmlFor="keywords" error={fieldErrors.keywords}>
        <input id="keywords" name="keywords" defaultValue={initial.keywords} className={inputClass} />
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

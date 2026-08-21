"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Plus, X } from "lucide-react";
import { saveResearchAction, type SaveResearchState } from "./actions";
import { RESEARCH_STATUSES, type MetricRow } from "@/lib/validation/research";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  IN_REVIEW: "In Review",
  PRESENTED: "Presented",
  PUBLISHED: "Published",
};

export type ResearchFormInitialValues = {
  title: string;
  description: string;
  authors: string;
  conference: string;
  status: string;
  year: string;
  doi: string;
  paperUrl: string;
  featured: boolean;
  published: boolean;
  metrics: MetricRow[];
};

const EMPTY_VALUES: ResearchFormInitialValues = {
  title: "",
  description: "",
  authors: "",
  conference: "",
  status: "PUBLISHED",
  year: "",
  doi: "",
  paperUrl: "",
  featured: false,
  published: false,
  metrics: [],
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

export default function ResearchForm({
  researchId,
  initial = EMPTY_VALUES,
  submitLabel,
}: {
  researchId: string | null;
  initial?: ResearchFormInitialValues;
  submitLabel: string;
}) {
  const boundAction = saveResearchAction.bind(null, researchId);
  const initialState: SaveResearchState = { error: null };
  const [state, formAction] = useActionState(boundAction, initialState);
  const fieldErrors = state.fieldErrors ?? {};
  const [metrics, setMetrics] = useState<MetricRow[]>(initial.metrics.length > 0 ? initial.metrics : [{ label: "", value: "" }]);

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

      <Field label="Description" htmlFor="description" error={fieldErrors.description}>
        <textarea id="description" name="description" defaultValue={initial.description} rows={4} className={inputClass} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Authors (comma-separated)" htmlFor="authors" error={fieldErrors.authors}>
          <input id="authors" name="authors" defaultValue={initial.authors} className={inputClass} placeholder="Karthik B, ..." />
        </Field>
        <Field label="Conference" htmlFor="conference" error={fieldErrors.conference}>
          <input id="conference" name="conference" defaultValue={initial.conference} className={inputClass} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Status" htmlFor="status" error={fieldErrors.status}>
          <select id="status" name="status" defaultValue={initial.status} className={inputClass}>
            {RESEARCH_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Year" htmlFor="year" error={fieldErrors.year}>
          <input id="year" name="year" type="number" defaultValue={initial.year} className={inputClass} placeholder="2026" />
        </Field>
        <Field label="DOI" htmlFor="doi" error={fieldErrors.doi}>
          <input id="doi" name="doi" defaultValue={initial.doi} className={inputClass} />
        </Field>
      </div>

      <Field label="Paper URL" htmlFor="paperUrl" error={fieldErrors.paperUrl}>
        <input id="paperUrl" name="paperUrl" type="url" defaultValue={initial.paperUrl} className={inputClass} />
      </Field>

      <div>
        <p className="text-xs font-medium text-muted">Metrics (instrument readouts)</p>
        <div className="mt-2 flex flex-col gap-2">
          {metrics.map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                name="metricLabel"
                defaultValue={m.label}
                placeholder="Label (e.g. F1-score)"
                className={`${inputClass} flex-1`}
              />
              <input
                name="metricValue"
                defaultValue={m.value}
                placeholder="Value (e.g. 95.0%)"
                className={`${inputClass} flex-1`}
              />
              <button
                type="button"
                onClick={() => setMetrics((rows) => rows.filter((_, idx) => idx !== i))}
                aria-label="Remove metric"
                className="text-muted hover:text-red-400"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setMetrics((rows) => [...rows, { label: "", value: "" }])}
            className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted hover:text-foreground"
          >
            <Plus size={12} /> Add metric
          </button>
        </div>
      </div>

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

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle } from "lucide-react";
import { saveOverrideAction, type SaveOverrideState } from "./actions";

export type OverrideFormInitialValues = {
  alias: string;
  categories: string;
  displayOrder: string;
  caseStudySlug: string;
  featured: boolean;
  hidden: boolean;
};

const inputClass =
  "rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent/50";

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-xs font-medium text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-transform hover:scale-[1.02] disabled:opacity-60"
    >
      {pending ? "Saving..." : "Save"}
    </button>
  );
}

export default function OverrideForm({
  repoName,
  initial,
}: {
  repoName: string;
  initial: OverrideFormInitialValues;
}) {
  const boundAction = saveOverrideAction.bind(null, repoName);
  const initialState: SaveOverrideState = { error: null };
  const [state, formAction] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.error && (
        <p className="flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle size={15} /> {state.error}
        </p>
      )}

      <Field label="Alias (display name override)" htmlFor="alias">
        <input id="alias" name="alias" defaultValue={initial.alias} className={inputClass} placeholder={repoName} />
      </Field>

      <Field label="Categories (comma-separated)" htmlFor="categories">
        <input id="categories" name="categories" defaultValue={initial.categories} className={inputClass} placeholder="Full-Stack, AI/ML" />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Display Order (lower = earlier)" htmlFor="displayOrder">
          <input id="displayOrder" name="displayOrder" type="number" defaultValue={initial.displayOrder} className={inputClass} />
        </Field>
        <Field label="Linked Case Study Slug" htmlFor="caseStudySlug">
          <input id="caseStudySlug" name="caseStudySlug" defaultValue={initial.caseStudySlug} className={inputClass} placeholder="e.g. vibehive" />
        </Field>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={initial.featured} className="h-4 w-4 accent-accent" />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="hidden" defaultChecked={initial.hidden} className="h-4 w-4 accent-accent" />
          Hidden (excluded from the public feed entirely)
        </label>
      </div>

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}

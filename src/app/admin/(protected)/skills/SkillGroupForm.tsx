"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle } from "lucide-react";
import { saveSkillGroupAction, type SaveSkillGroupState } from "./actions";

export type SkillGroupFormInitialValues = {
  category: string;
  items: string;
  published: boolean;
};

const EMPTY_VALUES: SkillGroupFormInitialValues = {
  category: "",
  items: "",
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

export default function SkillGroupForm({
  skillGroupId,
  initial = EMPTY_VALUES,
  submitLabel,
}: {
  skillGroupId: string | null;
  initial?: SkillGroupFormInitialValues;
  submitLabel: string;
}) {
  const boundAction = saveSkillGroupAction.bind(null, skillGroupId);
  const initialState: SaveSkillGroupState = { error: null };
  const [state, formAction] = useActionState(boundAction, initialState);
  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.error && (
        <p className="flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle size={15} /> {state.error}
        </p>
      )}

      <Field label="Category" htmlFor="category" error={fieldErrors.category}>
        <input
          id="category"
          name="category"
          defaultValue={initial.category}
          required
          className={inputClass}
          placeholder="Languages, Full-Stack, AI / ML & Computer Vision, ..."
        />
      </Field>

      <Field label="Items (comma-separated)" htmlFor="items" error={fieldErrors.items}>
        <textarea
          id="items"
          name="items"
          defaultValue={initial.items}
          rows={3}
          className={inputClass}
          placeholder="Python, TypeScript, React.js, Next.js"
        />
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

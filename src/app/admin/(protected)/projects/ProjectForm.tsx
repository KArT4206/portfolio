"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle } from "lucide-react";
import { saveProjectAction, type SaveProjectState } from "./actions";
import { PROJECT_STATUSES, PROJECT_CATEGORIES } from "@/lib/validation/project";

const STATUS_LABELS: Record<string, string> = {
  IN_DEVELOPMENT: "In Development",
  COMPLETED: "Completed",
  RESEARCH: "Research",
  PAUSED: "Paused",
  ARCHIVED: "Archived",
};

const CATEGORY_LABELS: Record<string, string> = {
  SOFTWARE_ENGINEERING: "Software Engineering",
  FULL_STACK: "Full Stack",
  AI_ML: "AI / ML",
  CYBERSECURITY: "Cybersecurity",
  EMBEDDED_SYSTEMS: "Embedded Systems",
  IOT: "IoT",
  RESEARCH: "Research",
  HARDWARE: "Hardware",
  OTHER: "Other",
};

export type ProjectFormInitialValues = {
  title: string;
  slug: string;
  shortDescription: string;
  detailedDescription: string;
  role: string;
  technologies: string;
  githubUrl: string;
  demoUrl: string;
  docsUrl: string;
  paperUrl: string;
  startDate: string;
  endDate: string;
  status: string;
  categories: string[];
  featured: boolean;
  published: boolean;
  coverImageUrl?: string | null;
};

const EMPTY_VALUES: ProjectFormInitialValues = {
  title: "",
  slug: "",
  shortDescription: "",
  detailedDescription: "",
  role: "",
  technologies: "",
  githubUrl: "",
  demoUrl: "",
  docsUrl: "",
  paperUrl: "",
  startDate: "",
  endDate: "",
  status: "IN_DEVELOPMENT",
  categories: [],
  featured: false,
  published: false,
  coverImageUrl: null,
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

export default function ProjectForm({
  projectId,
  initial = EMPTY_VALUES,
  submitLabel,
}: {
  projectId: string | null;
  initial?: ProjectFormInitialValues;
  submitLabel: string;
}) {
  const boundAction = saveProjectAction.bind(null, projectId);
  const initialState: SaveProjectState = { error: null };
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
        <Field label="Title" htmlFor="title" error={fieldErrors.title}>
          <input id="title" name="title" defaultValue={initial.title} required className={inputClass} />
        </Field>
        <Field label="Slug (optional — auto-generated from title)" htmlFor="slug" error={fieldErrors.slug}>
          <input id="slug" name="slug" defaultValue={initial.slug} className={inputClass} placeholder="my-project" />
        </Field>
      </div>

      <Field label="Short Description" htmlFor="shortDescription" error={fieldErrors.shortDescription}>
        <textarea
          id="shortDescription"
          name="shortDescription"
          defaultValue={initial.shortDescription}
          required
          rows={2}
          className={inputClass}
        />
      </Field>

      <Field label="Detailed Description" htmlFor="detailedDescription" error={fieldErrors.detailedDescription}>
        <textarea
          id="detailedDescription"
          name="detailedDescription"
          defaultValue={initial.detailedDescription}
          rows={5}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Role" htmlFor="role" error={fieldErrors.role}>
          <input id="role" name="role" defaultValue={initial.role} className={inputClass} />
        </Field>
        <Field label="Technologies (comma-separated)" htmlFor="technologies" error={fieldErrors.technologies}>
          <input
            id="technologies"
            name="technologies"
            defaultValue={initial.technologies}
            className={inputClass}
            placeholder="Next.js, PostgreSQL, Prisma"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="GitHub URL" htmlFor="githubUrl" error={fieldErrors.githubUrl}>
          <input id="githubUrl" name="githubUrl" type="url" defaultValue={initial.githubUrl} className={inputClass} />
        </Field>
        <Field label="Live Demo URL" htmlFor="demoUrl" error={fieldErrors.demoUrl}>
          <input id="demoUrl" name="demoUrl" type="url" defaultValue={initial.demoUrl} className={inputClass} />
        </Field>
        <Field label="Documentation URL" htmlFor="docsUrl" error={fieldErrors.docsUrl}>
          <input id="docsUrl" name="docsUrl" type="url" defaultValue={initial.docsUrl} className={inputClass} />
        </Field>
        <Field label="Research Paper URL" htmlFor="paperUrl" error={fieldErrors.paperUrl}>
          <input id="paperUrl" name="paperUrl" type="url" defaultValue={initial.paperUrl} className={inputClass} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Start Date" htmlFor="startDate" error={fieldErrors.startDate}>
          <input id="startDate" name="startDate" type="date" defaultValue={initial.startDate} className={inputClass} />
        </Field>
        <Field label="End Date" htmlFor="endDate" error={fieldErrors.endDate}>
          <input id="endDate" name="endDate" type="date" defaultValue={initial.endDate} className={inputClass} />
        </Field>
        <Field label="Status" htmlFor="status" error={fieldErrors.status}>
          <select id="status" name="status" defaultValue={initial.status} className={inputClass}>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div>
        <p className="text-xs font-medium text-muted">Categories</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PROJECT_CATEGORIES.map((c) => (
            <label
              key={c}
              className="flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs has-checked:border-accent/50 has-checked:text-accent"
            >
              <input
                type="checkbox"
                name="categories"
                value={c}
                defaultChecked={initial.categories.includes(c)}
                className="h-3 w-3 accent-accent"
              />
              {CATEGORY_LABELS[c]}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={initial.featured} className="h-4 w-4 accent-accent" />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="published"
            defaultChecked={initial.published}
            className="h-4 w-4 accent-accent"
          />
          Published (visible on the public site)
        </label>
      </div>

      <Field label="Cover Image" htmlFor="coverImage" error={fieldErrors.coverImage}>
        {initial.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={initial.coverImageUrl}
            alt="Current cover"
            className="mb-2 h-32 w-56 rounded-lg border border-border object-cover"
          />
        )}
        <input
          id="coverImage"
          name="coverImage"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-xs file:text-foreground"
        />
      </Field>

      <div>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}

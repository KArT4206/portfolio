"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle } from "lucide-react";
import { saveCertificationAction, type SaveCertificationState } from "./actions";

export type CertificationFormInitialValues = {
  name: string;
  issuer: string;
  credentialId: string;
  credentialUrl: string;
  description: string;
  issueDate: string;
  expiresDate: string;
  published: boolean;
  certificateFileUrl?: string | null;
};

const EMPTY_VALUES: CertificationFormInitialValues = {
  name: "",
  issuer: "",
  credentialId: "",
  credentialUrl: "",
  description: "",
  issueDate: "",
  expiresDate: "",
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

export default function CertificationForm({
  certificationId,
  initial = EMPTY_VALUES,
  submitLabel,
}: {
  certificationId: string | null;
  initial?: CertificationFormInitialValues;
  submitLabel: string;
}) {
  const boundAction = saveCertificationAction.bind(null, certificationId);
  const initialState: SaveCertificationState = { error: null };
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
        <Field label="Certification Name" htmlFor="name" error={fieldErrors.name}>
          <input id="name" name="name" defaultValue={initial.name} required className={inputClass} />
        </Field>
        <Field label="Issuing Organization" htmlFor="issuer" error={fieldErrors.issuer}>
          <input id="issuer" name="issuer" defaultValue={initial.issuer} required className={inputClass} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Credential ID" htmlFor="credentialId" error={fieldErrors.credentialId}>
          <input id="credentialId" name="credentialId" defaultValue={initial.credentialId} className={inputClass} />
        </Field>
        <Field label="Credential URL" htmlFor="credentialUrl" error={fieldErrors.credentialUrl}>
          <input
            id="credentialUrl"
            name="credentialUrl"
            type="url"
            defaultValue={initial.credentialUrl}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Description" htmlFor="description" error={fieldErrors.description}>
        <textarea id="description" name="description" defaultValue={initial.description} rows={3} className={inputClass} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Issue Date" htmlFor="issueDate" error={fieldErrors.issueDate}>
          <input id="issueDate" name="issueDate" type="date" defaultValue={initial.issueDate} className={inputClass} />
        </Field>
        <Field label="Expires (leave blank if it does not expire)" htmlFor="expiresDate" error={fieldErrors.expiresDate}>
          <input id="expiresDate" name="expiresDate" type="date" defaultValue={initial.expiresDate} className={inputClass} />
        </Field>
      </div>

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
          The public site only shows a certificate action once a credential URL or file is actually set here.
        </p>
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

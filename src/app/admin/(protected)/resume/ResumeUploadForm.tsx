"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Upload } from "lucide-react";
import { uploadResumeAction, type UploadResumeState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background disabled:opacity-60"
    >
      <Upload size={14} /> {pending ? "Uploading..." : "Add Resume"}
    </button>
  );
}

export default function ResumeUploadForm() {
  const initialState: UploadResumeState = { error: null };
  const [state, formAction] = useActionState(uploadResumeAction, initialState);

  return (
    <form action={formAction} className="rounded-2xl border border-dashed border-border p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="label"
          placeholder='Label (e.g. "Resume — Aug 2026")'
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent/50"
        />
        <input
          name="file"
          type="file"
          accept="application/pdf"
          className="text-sm text-muted file:mr-2 file:rounded-full file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-xs"
        />
      </div>
      <div className="mt-3">
        <input
          name="externalUrl"
          type="url"
          placeholder="or an external URL instead of a file upload"
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent/50"
        />
      </div>
      <div className="mt-3 flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="makeActive" defaultChecked className="h-4 w-4 accent-accent" />
          Set as active resume
        </label>
        <SubmitButton />
      </div>
      {state.error && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle size={12} /> {state.error}
        </p>
      )}
    </form>
  );
}

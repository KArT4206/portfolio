"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Upload } from "lucide-react";
import { uploadStandaloneMediaAction, type UploadStandaloneMediaState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background disabled:opacity-60"
    >
      <Upload size={14} /> {pending ? "Uploading..." : "Upload"}
    </button>
  );
}

export default function MediaUploadForm() {
  const initialState: UploadStandaloneMediaState = { error: null };
  const [state, formAction] = useActionState(uploadStandaloneMediaAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-border p-5">
      <input
        name="file"
        type="file"
        required
        accept="application/pdf,image/png,image/jpeg,image/webp,image/gif,.doc,.docx,.zip"
        className="text-sm text-muted file:mr-2 file:rounded-full file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-xs"
      />
      <SubmitButton />
      {state.error && (
        <p className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle size={12} /> {state.error}
        </p>
      )}
    </form>
  );
}

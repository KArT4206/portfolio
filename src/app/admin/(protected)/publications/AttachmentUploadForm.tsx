"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Upload } from "lucide-react";
import { uploadPublicationAttachmentAction, type UploadPublicationAttachmentState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background disabled:opacity-60"
    >
      <Upload size={12} /> {pending ? "Uploading..." : "Upload"}
    </button>
  );
}

export default function AttachmentUploadForm({ publicationId }: { publicationId: string }) {
  const boundAction = uploadPublicationAttachmentAction.bind(null, publicationId);
  const initialState: UploadPublicationAttachmentState = { error: null };
  const [state, formAction] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="rounded-xl border border-dashed border-border p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
        <input
          name="label"
          placeholder='Label (e.g. "PDF Preprint")'
          required
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs outline-none focus:border-accent/50"
        />
        <input
          name="description"
          placeholder="Description (optional)"
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs outline-none focus:border-accent/50"
        />
        <select
          name="visibility"
          defaultValue="PUBLIC"
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs outline-none"
        >
          <option value="PUBLIC">Public</option>
          <option value="PRIVATE">Private</option>
        </select>
        <input
          name="file"
          type="file"
          required
          accept="application/pdf,image/*,.doc,.docx,.zip"
          className="text-xs text-muted file:mr-2 file:rounded-full file:border-0 file:bg-surface-2 file:px-2.5 file:py-1 file:text-[11px]"
        />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <SubmitButton />
        {state.error && (
          <p className="flex items-center gap-1.5 text-xs text-red-400">
            <AlertCircle size={12} /> {state.error}
          </p>
        )}
      </div>
    </form>
  );
}

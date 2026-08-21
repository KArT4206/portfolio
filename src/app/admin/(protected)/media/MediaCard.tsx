"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Check, Pencil, Trash2 } from "lucide-react";
import { renameMediaAction, deleteMediaAction, type DeleteMediaState } from "./actions";

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-label="Delete" className="text-muted hover:text-red-400 disabled:opacity-50">
      <Trash2 size={14} />
    </button>
  );
}

export default function MediaCard({
  id,
  originalName,
  url,
  mimeType,
  size,
  createdAt,
  usage,
}: {
  id: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
  usage: number;
}) {
  const [editing, setEditing] = useState(false);
  const boundDelete = deleteMediaAction.bind(null, id);
  const initialState: DeleteMediaState = { error: null };
  const [state, formAction] = useActionState(boundDelete, initialState);

  const isImage = mimeType.startsWith("image/");

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-2">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={originalName} className="h-full w-full object-cover" />
          ) : (
            <span className="text-[10px] uppercase text-muted">{mimeType.split("/")[1] ?? "file"}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {editing ? (
            <form
              action={async (formData) => {
                await renameMediaAction(id, formData);
                setEditing(false);
              }}
              className="flex items-center gap-2"
            >
              <input
                name="originalName"
                defaultValue={originalName}
                autoFocus
                className="w-full rounded border border-border bg-surface-2 px-2 py-1 text-sm outline-none focus:border-accent/50"
              />
              <button type="submit" aria-label="Save name" className="text-accent">
                <Check size={14} />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <p className="truncate text-sm">{originalName}</p>
              <button type="button" onClick={() => setEditing(true)} aria-label="Rename" className="text-muted hover:text-foreground">
                <Pencil size={12} />
              </button>
            </div>
          )}
          <p className="mt-0.5 text-xs text-muted">
            {mimeType} · {(size / 1024).toFixed(0)}KB · {new Date(createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-xs ${usage > 0 ? "text-accent" : "text-muted"}`}>
          {usage > 0 ? `Used by ${usage} item${usage === 1 ? "" : "s"}` : "Unused"}
        </span>
        <div className="flex items-center gap-3">
          <a href={url} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline">
            View
          </a>
          <form action={formAction}>
            <DeleteButton />
          </form>
        </div>
      </div>
      {state.error && (
        <p className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle size={12} /> {state.error}
        </p>
      )}
    </div>
  );
}

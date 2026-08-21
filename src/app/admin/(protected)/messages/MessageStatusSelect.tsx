"use client";

import { useTransition } from "react";
import { setMessageStatusAction } from "./actions";
import type { ContactMessageStatus } from "@/generated/prisma/enums";

const OPTIONS: ContactMessageStatus[] = ["NEW", "READ", "REPLIED", "ARCHIVED"];

export default function MessageStatusSelect({ id, status }: { id: string; status: ContactMessageStatus }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as ContactMessageStatus;
        startTransition(() => {
          setMessageStatusAction(id, next);
        });
      }}
      className="rounded-md border border-border bg-surface-2 px-2 py-1 text-xs outline-none disabled:opacity-60"
    >
      {OPTIONS.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

import "server-only";
import { prisma } from "@/lib/prisma";
import type { AuditResult } from "@/generated/prisma/enums";

export async function logAudit(entry: {
  action: string;
  actorId?: string | null;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ip?: string | null;
  result?: AuditResult;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        action: entry.action,
        actorId: entry.actorId ?? null,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        metadata: entry.metadata as never,
        ip: entry.ip ?? null,
        result: entry.result ?? "SUCCESS",
      },
    });
  } catch (err) {
    // Audit logging must never take down the actual operation it's describing.
    console.error("[audit] failed to record entry:", entry.action, err);
  }
}

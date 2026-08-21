import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import CertificationForm, { type CertificationFormInitialValues } from "../CertificationForm";
import { softDeleteCertificationAction, removeCertificationCertificateAction } from "../actions";

export const metadata: Metadata = { title: "Edit Certification" };

function toDateInput(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export default async function EditCertificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const item = await prisma.certification.findUnique({
    where: { id, deletedAt: null },
    include: { certificateMedia: true },
  });

  if (!item) notFound();

  const initial: CertificationFormInitialValues = {
    name: item.name,
    issuer: item.issuer,
    credentialId: item.credentialId ?? "",
    credentialUrl: item.credentialUrl ?? "",
    description: item.description ?? "",
    issueDate: toDateInput(item.issueDate),
    expiresDate: toDateInput(item.expiresDate),
    published: item.published,
    certificateFileUrl: item.certificateMedia?.url ?? null,
  };

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <Link href="/admin/certifications" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft size={14} /> Back to certifications
      </Link>
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">{item.name}</h1>

      {item.certificateMedia && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
          <p className="text-sm">
            Uploaded certificate: <span className="text-muted">{item.certificateMedia.originalName}</span>
          </p>
          <form action={removeCertificationCertificateAction.bind(null, item.id)}>
            <button type="submit" aria-label="Remove certificate" className="text-muted hover:text-red-400">
              <X size={14} />
            </button>
          </form>
        </div>
      )}

      <div className="mt-6">
        <CertificationForm certificationId={item.id} initial={initial} submitLabel="Save Changes" />
      </div>

      <div className="mt-12 rounded-xl border border-red-400/20 bg-red-400/5 p-5">
        <p className="text-sm font-medium text-red-400">Danger Zone</p>
        <p className="mt-1 text-xs text-muted">
          Removes this certification from the public site and admin list. It stays in the database and can be restored directly if needed.
        </p>
        <form action={softDeleteCertificationAction.bind(null, item.id)} className="mt-3">
          <button
            type="submit"
            className="rounded-full border border-red-400/40 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-400/10"
          >
            Delete Certification
          </button>
        </form>
      </div>
    </div>
  );
}

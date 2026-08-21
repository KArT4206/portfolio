import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import EducationForm, { type EducationFormInitialValues } from "../EducationForm";
import { softDeleteEducationAction } from "../actions";

export const metadata: Metadata = { title: "Edit Education" };

function toDateInput(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export default async function EditEducationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const item = await prisma.education.findUnique({ where: { id, deletedAt: null } });
  if (!item) notFound();

  const initial: EducationFormInitialValues = {
    school: item.school,
    degree: item.degree,
    location: item.location ?? "",
    startDate: toDateInput(item.startDate),
    endDate: toDateInput(item.endDate),
    coursework: item.coursework.join(", "),
    published: item.published,
  };

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <Link href="/admin/education" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft size={14} /> Back to education
      </Link>
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">{item.school}</h1>

      <div className="mt-6">
        <EducationForm educationId={item.id} initial={initial} submitLabel="Save Changes" />
      </div>

      <div className="mt-12 rounded-xl border border-red-400/20 bg-red-400/5 p-5">
        <p className="text-sm font-medium text-red-400">Danger Zone</p>
        <p className="mt-1 text-xs text-muted">
          Removes this entry from the public site and admin list. It stays in the database and can be restored directly if needed.
        </p>
        <form action={softDeleteEducationAction.bind(null, item.id)} className="mt-3">
          <button
            type="submit"
            className="rounded-full border border-red-400/40 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-400/10"
          >
            Delete Education
          </button>
        </form>
      </div>
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const CONTACT_RECIPIENT = "bkarthik0404@gmail.com";

type ContactPayload = {
  name: string;
  email: string;
  subject?: string;
  message: string;
};

function isValidPayload(body: unknown): body is ContactPayload {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.name === "string" &&
    b.name.trim().length > 0 &&
    typeof b.email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email) &&
    (b.subject === undefined || typeof b.subject === "string") &&
    typeof b.message === "string" &&
    b.message.trim().length > 0
  );
}

/**
 * Delivers a validated contact-form submission by email via Resend, when
 * RESEND_API_KEY is configured. The message is always persisted to
 * ContactMessage first (see POST below) regardless of this succeeding — this
 * is a best-effort real-time notification on top of that, never the only
 * record of the submission.
 */
async function deliverContactMessage(payload: ContactPayload): Promise<{ delivered: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("[contact] RESEND_API_KEY not configured — message stored, no email sent");
    return { delivered: false };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: CONTACT_RECIPIENT,
      replyTo: payload.email,
      subject: payload.subject?.trim() || `Portfolio contact from ${payload.name}`,
      text: `From: ${payload.name} <${payload.email}>\n\n${payload.message}`,
    });
    if (error) {
      console.error("[contact] Resend delivery failed:", error);
      return { delivered: false };
    }
    return { delivered: true };
  } catch (err) {
    console.error("[contact] Resend delivery threw:", err);
    return { delivered: false };
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!isValidPayload(body)) {
    return NextResponse.json(
      { ok: false, error: "Please fill in a valid name, email, and message." },
      { status: 400 }
    );
  }

  try {
    await prisma.contactMessage.create({
      data: {
        name: body.name.trim(),
        email: body.email.trim(),
        subject: body.subject?.trim() || null,
        message: body.message.trim(),
      },
    });
  } catch (err) {
    console.error("[contact] failed to store submission:", err);
    return NextResponse.json(
      { ok: false, error: "Couldn't deliver your message right now — please try again shortly." },
      { status: 502 }
    );
  }

  const { delivered } = await deliverContactMessage(body);

  return NextResponse.json({ ok: true, delivered });
}

import { NextRequest, NextResponse } from "next/server";

type ContactPayload = {
  name: string;
  email: string;
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
    typeof b.message === "string" &&
    b.message.trim().length > 0
  );
}

/**
 * Delivers a validated contact-form submission.
 *
 * TODO(you): wire this up to an actual email/notification channel. This is a
 * genuine architecture decision with real trade-offs — pick the one that
 * matches how much infra you want to own:
 *
 *   1. Resend (recommended for Vercel): npm i resend, then call
 *      `resend.emails.send(...)` with a RESEND_API_KEY env var.
 *      Pros: 3 lines of code, great deliverability. Cons: third-party dependency.
 *
 *   2. Nodemailer + your own SMTP (e.g. Gmail app password):
 *      Pros: no new vendor. Cons: Gmail SMTP has sending limits and can get
 *      flagged as spam; app-password setup is fiddly.
 *
 *   3. A hosted form service (Formspree, Web3Forms): skip this route
 *      entirely and point the form's `action` at their endpoint instead.
 *      Pros: zero backend code. Cons: another account, less control over the UX.
 *
 * Until you pick one, this handler validates input and logs it server-side
 * so nothing is silently lost — check your Vercel function logs.
 */
async function deliverContactMessage(payload: ContactPayload): Promise<void> {
  console.log("[contact] new submission:", payload);
  // TODO(you): replace the console.log above with real delivery, e.g.:
  //
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: "portfolio@yourdomain.com",
  //   to: "bkarthik0404@gmail.com",
  //   subject: `Portfolio contact from ${payload.name}`,
  //   text: `${payload.email}\n\n${payload.message}`,
  // });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!isValidPayload(body)) {
    return NextResponse.json(
      { ok: false, error: "Please fill in a valid name, email, and message." },
      { status: 400 }
    );
  }

  await deliverContactMessage(body);

  return NextResponse.json({ ok: true });
}

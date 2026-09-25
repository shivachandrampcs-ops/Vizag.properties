/**
 * Notification façade.
 *
 * Email / WhatsApp delivery is intentionally NOT part of this first
 * implementation — the project has no mail/WhatsApp infrastructure yet and the
 * feature must ship without it.
 *
 * Every place that *would* notify someone goes through `notify()` instead, so
 * adding a provider later is a single change in this file:
 *
 *   notify("property_approved", { to, ... })
 *     → sendEmail(...) / sendWhatsApp(...) once wired
 *
 * Until then events are logged in a structured way (useful for debugging and
 * for building an in-app notification centre later).
 */

export type NotificationEvent =
  | "registration"
  | "property_submitted"
  | "property_approved"
  | "property_rejected"
  | "new_lead"
  | "account_verified";

export type NotificationPayload = {
  to?: { name?: string | null; email?: string | null; phone?: string | null };
  subject?: string;
  data?: Record<string, unknown>;
};

export async function notify(
  event: NotificationEvent,
  payload: NotificationPayload = {}
): Promise<void> {
  // Keep the payload free of secrets/PII-heavy fields in logs.
  console.info(
    `[notify:${event}]`,
    JSON.stringify({
      to: payload.to?.email ?? payload.to?.phone ?? null,
      subject: payload.subject ?? null,
      data: payload.data ?? null,
    })
  );

  // ── Future integration point ───────────────────────────────
  // switch (event) {
  //   case "registration":       await sendWelcomeEmail(...); break;
  //   case "property_submitted": await notifyAdmins(...);     break;
  //   case "property_approved":
  //   case "property_rejected":  await sendPropertyStatusMail(...); break;
  //   case "new_lead":           await notifySeller(...);     break;
  // }
  return;
}

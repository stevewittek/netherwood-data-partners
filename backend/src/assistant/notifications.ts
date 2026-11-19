import { AssistantStore, type Inquiry } from "./store.ts";

export type InquirySender = (inquiry: Inquiry) => Promise<void>;
export function createInquirySender(
  url: string,
  fetcher: typeof fetch = fetch,
): InquirySender {
  // Existing business form provider, not a visitor-controlled destination.
  if (!/^https:\/\/submit-form\.com\/[A-Za-z0-9]+$/.test(url))
    throw new Error("invalid_notification_destination");
  return async (inquiry) => {
    const response = await fetcher(url, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name: inquiry.name,
        email: inquiry.email,
        message: inquiry.message,
        source: "Netherwood website chatbot",
        topic: inquiry.topic,
        inquiry_reference: inquiry.id,
        consent: "Visitor requested personal follow-up",
        _email: { subject: "Netherwood chatbot inquiry" },
        _honeypot: "",
      }),
      signal: AbortSignal.timeout(10_000),
      redirect: "error",
    });
    if (!response.ok) throw new Error("notification_not_accepted");
    // Provider acceptance is not proof of final mailbox delivery.
  };
}

export async function deliverNextInquiry(
  store: AssistantStore,
  send: InquirySender,
  now = Date.now(),
): Promise<"idle" | "accepted" | "retry" | "failed"> {
  const job = await store.change((state) => {
    // Recover a worker interrupted after it claimed a job. A lost acknowledgment may
    // cause a duplicate email; the stable reference lets the owner recognize it.
    const inquiry = state.inquiries.find(
      (i) =>
        i.notification &&
        ((i.notification.status === "pending" &&
          i.notification.nextAttempt <= now) ||
          (i.notification.status === "sending" &&
            now - (i.notification.lastAttempt ?? 0) > 120_000)),
    );
    if (!inquiry?.notification) return undefined;
    if (inquiry.notification.attempts >= 5) {
      inquiry.notification.status = "failed";
      return undefined;
    }
    inquiry.notification.status = "sending";
    inquiry.notification.attempts++;
    inquiry.notification.lastAttempt = now;
    return structuredClone(inquiry);
  });
  if (!job) return "idle";
  let accepted = false;
  try {
    await send(job);
    accepted = true;
  } catch {
    /* no provider bodies or visitor details in logs */
  }
  return store.change((state) => {
    const notification = state.inquiries.find(
      (i) => i.id === job.id,
    )?.notification;
    if (!notification) return "idle";
    if (accepted) {
      notification.status = "accepted";
      notification.acceptedAt = now;
      return "accepted";
    }
    notification.status = notification.attempts >= 5 ? "failed" : "pending";
    notification.nextAttempt =
      now + Math.min(3600_000, 60_000 * 2 ** (notification.attempts - 1));
    return notification.status === "failed" ? "failed" : "retry";
  });
}

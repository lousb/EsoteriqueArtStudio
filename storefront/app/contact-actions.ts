"use server";

import { createClient } from "@sanity/client";
import { client } from "../sanity/client";
import { apiVersion, dataset, projectId } from "../sanity/api";

export type ContactField = "name" | "email" | "subject" | "message";

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<ContactField, string>>;
  values?: Partial<Record<ContactField, string>>;
};

type ContactConfig = {
  email?: string | null;
  formEnabled?: boolean | null;
  formRecipient?: string | null;
  formSubjects?: string[] | null;
  formSuccessMessage?: string | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_SUCCESS =
  "Thank you, your message is on its way to us. We will reply as soon as we can.";

const str = (v: FormDataEntryValue | null, max: number) =>
  (typeof v === "string" ? v : "").trim().slice(0, max);

async function loadConfig(): Promise<ContactConfig | null> {
  try {
    return await client
      .withConfig({
        useCdn: false,
        token: process.env.SANITY_API_READ_TOKEN,
        perspective: "published",
        stega: false,
      })
      .fetch<ContactConfig | null>(
        `*[_type == "settings"][0].contact{email, formEnabled, formRecipient, formSubjects, formSuccessMessage}`,
      );
  } catch (error) {
    console.error("[contact] could not load settings", error);
    return null;
  }
}

async function saveSubmission(values: Record<ContactField, string>) {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) return false;
  try {
    const writer = createClient({
      projectId,
      dataset,
      apiVersion,
      token,
      useCdn: false,
    });
    await writer.create({
      _type: "contactSubmission",
      ...values,
      submittedAt: new Date().toISOString(),
      status: "new",
    });
    return true;
  } catch (error) {
    console.error("[contact] could not save submission to Sanity", error);
    return false;
  }
}

async function sendEmail(
  to: string,
  values: Record<ContactField, string>,
): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const from =
      process.env.CONTACT_FROM_EMAIL ||
      "Esoterique Art Studio <onboarding@resend.dev>";
    // Newlines are stripped from anything that lands in a header.
    const oneLine = (t: string) => t.replace(/[\r\n]+/g, " ");
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: values.email,
        subject: oneLine(`[Website] ${values.subject} from ${values.name}`),
        text: [
          `Name: ${values.name}`,
          `Email: ${values.email}`,
          `Subject: ${values.subject}`,
          "",
          values.message,
        ].join("\n"),
      }),
    });
    if (!res.ok) {
      console.error("[contact] Resend error", res.status, await res.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("[contact] could not send email", error);
    return false;
  }
}

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot: real people never see or fill this field.
  if (str(formData.get("company"), 200)) {
    return { status: "success", message: DEFAULT_SUCCESS };
  }

  const values: Record<ContactField, string> = {
    name: str(formData.get("name"), 120),
    email: str(formData.get("email"), 200),
    subject: str(formData.get("subject"), 120),
    message: str(formData.get("message"), 5000),
  };

  const errors: ContactState["errors"] = {};
  if (!values.name) errors.name = "Please tell us your name.";
  if (!EMAIL_RE.test(values.email))
    errors.email = "Please enter a valid email address.";
  if (!values.subject) errors.subject = "Please choose a subject.";
  if (values.message.length < 10)
    errors.message = "Please write a little more so we can help.";

  if (Object.keys(errors).length) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors,
      values,
    };
  }

  const config = await loadConfig();
  if (config && config.formEnabled === false) {
    return {
      status: "error",
      message: "The contact form is switched off right now.",
      values,
    };
  }

  const recipient = config?.formRecipient || config?.email || "";

  const [saved, emailed] = await Promise.all([
    saveSubmission(values),
    recipient ? sendEmail(recipient, values) : Promise.resolve(false),
  ]);

  if (!saved && !emailed) {
    const fallback = config?.email
      ? ` Please email us directly at ${config.email}.`
      : "";
    return {
      status: "error",
      message: `Sorry, we could not send your message just now.${fallback}`,
      values,
    };
  }

  return {
    status: "success",
    message: config?.formSuccessMessage || DEFAULT_SUCCESS,
  };
}

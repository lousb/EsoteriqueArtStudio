"use client";

import { useActionState } from "react";
import {
  submitContact,
  type ContactState,
  type ContactField,
} from "../app/contact-actions";
import s from "./info-page.module.css";

const initialState: ContactState = { status: "idle" };

export function ContactForm({
  subjects,
  intro,
}: {
  subjects: string[];
  intro?: string | null;
}) {
  const [state, action, pending] = useActionState(submitContact, initialState);

  if (state.status === "success") {
    return (
      <div className={s.formSuccess} role="status">
        <p>{state.message}</p>
      </div>
    );
  }

  const err = (field: ContactField) => state.errors?.[field];
  const val = (field: ContactField) => state.values?.[field] ?? "";

  return (
    <form action={action} className={s.form} noValidate>
      {intro ? <p className={s.formIntro}>{intro}</p> : null}

      <div className={s.field}>
        <label htmlFor="cf-name">Name</label>
        <input
          id="cf-name"
          name="name"
          type="text"
          autoComplete="name"
          defaultValue={val("name")}
          aria-invalid={!!err("name")}
          required
        />
        {err("name") ? <span className={s.error}>{err("name")}</span> : null}
      </div>

      <div className={s.field}>
        <label htmlFor="cf-email">Email</label>
        <input
          id="cf-email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={val("email")}
          aria-invalid={!!err("email")}
          required
        />
        {err("email") ? <span className={s.error}>{err("email")}</span> : null}
      </div>

      <div className={s.field}>
        <label htmlFor="cf-subject">Subject</label>
        <select
          id="cf-subject"
          name="subject"
          defaultValue={val("subject")}
          aria-invalid={!!err("subject")}
          required
        >
          <option value="" disabled>
            Select a subject
          </option>
          {subjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
        {err("subject") ? (
          <span className={s.error}>{err("subject")}</span>
        ) : null}
      </div>

      <div className={s.field}>
        <label htmlFor="cf-message">Message</label>
        <textarea
          id="cf-message"
          name="message"
          rows={6}
          defaultValue={val("message")}
          aria-invalid={!!err("message")}
          required
        />
        {err("message") ? (
          <span className={s.error}>{err("message")}</span>
        ) : null}
      </div>

      {/* Honeypot, hidden from people and assistive tech */}
      <div className={s.honeypot} aria-hidden="true">
        <label htmlFor="cf-company">Company</label>
        <input
          id="cf-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {state.status === "error" && state.message ? (
        <p className={s.formError} role="alert">
          {state.message}
        </p>
      ) : null}

      <button type="submit" className={s.submit} disabled={pending}>
        {pending ? "Sending" : "Send message"}
      </button>
    </form>
  );
}

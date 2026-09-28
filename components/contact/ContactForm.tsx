"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { site } from "@/data/site";

export type ContactValues = { name: string; email: string; message: string };

const inputClass =
  "w-full rounded-lg border border-line bg-bg-input px-4 py-2.5 text-text-light outline-none transition-shadow focus:border-text focus:shadow-[0_0_0_2px_rgba(96,123,150,0.3)]";

export default function ContactForm({
  values,
  onChange,
}: {
  values: ContactValues;
  onChange: (v: ContactValues) => void;
}) {
  const [sent, setSent] = useState(false);

  const set = (key: keyof ContactValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange({ ...values, [key]: e.target.value });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // No backend: hand the message to the visitor's mail client.
    const subject = `Portfolio contact from ${values.name}`;
    const body = `${values.message}\n\n— ${values.name} <${values.email}>`;
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex max-w-sm flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-2xl text-white">Thank you! 🤘</h2>
        <p>Your mail app should open with the message ready to send. I&apos;ll get back to you soon!</p>
        <Button
          onClick={() => {
            onChange({ name: "", email: "", message: "" });
            setSent(false);
          }}
        >
          send-new-message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
      <label className="block space-y-2">
        <span>_name:</span>
        <input required value={values.name} onChange={set("name")} className={inputClass} />
      </label>
      <label className="block space-y-2">
        <span>_email:</span>
        <input required type="email" value={values.email} onChange={set("email")} className={inputClass} />
      </label>
      <label className="block space-y-2">
        <span>_message:</span>
        <textarea
          required
          rows={6}
          value={values.message}
          onChange={set("message")}
          placeholder="your message here ..."
          className={`${inputClass} resize-none placeholder:text-text`}
        />
      </label>
      <Button type="submit">submit-message</Button>
    </form>
  );
}

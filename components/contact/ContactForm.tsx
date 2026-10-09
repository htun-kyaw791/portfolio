"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

export type ContactValues = { name: string; email: string; message: string };

const inputClass =
  "w-full rounded-lg border border-line bg-bg-input px-4 py-2.5 text-text-light outline-none transition-shadow focus:border-text focus:ring-2 focus:ring-text/30";

export default function ContactForm({
  email,
  values,
  onChange,
}: {
  email: string;
  values: ContactValues;
  onChange: (v: ContactValues) => void;
}) {
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(`To: ${email}\n\n${values.message}\n\n— ${values.name} <${values.email}>`);
      setCopied(true);
    } catch {
      // Clipboard blocked (permissions / insecure context): the mailto link below still works.
    }
  }

  const set = (key: keyof ContactValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange({ ...values, [key]: e.target.value });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // No backend: hand the message to the visitor's mail client.
    const subject = `Portfolio contact from ${values.name}`;
    const body = `${values.message}\n\n— ${values.name} <${values.email}>`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex max-w-sm flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-2xl text-white">Almost there! 🤘</h2>
        <p>Your mail app should open with the message ready to send. I&apos;ll get back to you soon!</p>
        <p className="text-sm">
          {"// no mail app? copy the message and send it to "}
          <a href={`mailto:${email}`} className="break-all text-accent-coral hover:underline">
            {email}
          </a>
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="primary" onClick={copyMessage}>
            {copied ? "copied!" : "copy-message"}
          </Button>
          <Button
            onClick={() => {
              onChange({ name: "", email: "", message: "" });
              setSent(false);
              setCopied(false);
            }}
          >
            send-new-message
          </Button>
        </div>
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

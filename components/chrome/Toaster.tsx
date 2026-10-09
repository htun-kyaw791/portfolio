"use client";

import { useEffect, useState } from "react";
import { TOAST, type ToastDetail } from "@/lib/events";

const TOAST_MS = 2600;

/** Editor-style notification in the bottom-right corner. */
export default function Toaster() {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function onToast(e: Event) {
      const { message } = (e as CustomEvent<ToastDetail>).detail;
      setToast({ id: Date.now(), message });
      clearTimeout(timer);
      timer = setTimeout(() => setToast(null), TOAST_MS);
    }
    window.addEventListener(TOAST, onToast);
    return () => {
      window.removeEventListener(TOAST, onToast);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-16 right-4 z-[60] md:bottom-24 md:right-10 lg:right-14">
      {toast && (
        <p
          key={toast.id}
          className="animate-[toast-in_180ms_ease-out] rounded-md border border-line bg-bg-deep px-4 py-2.5 text-sm text-text-light shadow-lg"
        >
          <span className="text-accent-green">✓</span> {toast.message}
        </p>
      )}
    </div>
  );
}

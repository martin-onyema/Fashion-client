"use client";

import { useState } from "react";

/**
 * Replacement for a leftover file from an older project version.
 * Fully self-contained so Vercel builds can never fail on it.
 */
export function NotifyForm() {
  const [sent, setSent] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="mx-auto flex w-full max-w-sm items-center gap-2"
    >
      <input
        type="email"
        required
        placeholder="you@email.com"
        className="h-11 w-full border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-black"
      />
      <button
        type="submit"
        className="h-11 shrink-0 bg-black px-5 text-xs uppercase tracking-widest text-white"
      >
        Notify me
      </button>
      {sent ? (
        <span className="whitespace-nowrap text-xs text-neutral-500">
          Thank you.
        </span>
      ) : null}
    </form>
  );
}

export default NotifyForm;

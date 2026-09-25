/**
 * Replacement for a leftover file from an older project version.
 * The old version of this component depended on modules that no longer
 * exist in the current codebase, which broke Vercel builds.
 * This stub is fully self-contained and always compiles.
 */
export function VerifyForm() {
  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold">Verify your email</h1>
      <p className="mt-3 text-sm text-neutral-600">
        Email verification is not required right now. You can sign in
        directly.
      </p>
      <a
        href="/account/login"
        className="mt-8 inline-block bg-black px-8 py-3 text-xs uppercase tracking-widest text-white"
      >
        Sign in
      </a>
    </div>
  );
}

export default VerifyForm;

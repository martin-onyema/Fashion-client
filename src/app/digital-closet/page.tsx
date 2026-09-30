import NotifyForm from "./notify-form";

export default function DigitalClosetPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
        Wardrobecare
      </p>
      <h1 className="mt-4 text-3xl font-semibold">Digital Closet</h1>
      <p className="mt-3 text-sm text-neutral-600">
        Catalogue what you own, get wear suggestions and care reminders.
        We are putting the finishing touches on it — leave your email and
        we will tell you the moment it is ready.
      </p>
      <div className="mt-10 flex justify-center">
        <NotifyForm />
      </div>
    </main>
  );
}

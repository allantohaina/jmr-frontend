"use client";

import { useState } from "react";
import { useLocale } from "@/app/components/locale-provider";
import { authenticateWithForm } from "@/app/lib";

type AuthAccessSectionProps = {
  nextPath?: string;
  error?: string | null;
};

function resolveAuthErrorMessage(error?: string | null) {
  if (!error) {
    return "";
  }

  if (error === "auth_failed") {
    return "Connexion impossible. Verifiez vos identifiants ou reessayez.";
  }

  return error;
}

export function AuthAccessSection({ nextPath = "/mon-profil", error }: AuthAccessSectionProps) {
  const { messages } = useLocale();
  const [errorMessage, setErrorMessage] = useState(resolveAuthErrorMessage(error));
  const [pendingIntent, setPendingIntent] = useState<"login" | "signup" | null>(null);

  async function handleAuthSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const intent = formData.get("intent") === "signup" ? "signup" : "login";

    setPendingIntent(intent);
    setErrorMessage("");

    try {
      const { redirectTo } = await authenticateWithForm(formData);
      window.location.assign(redirectTo);
    } catch (submitError) {
      const message =
        submitError instanceof Error && submitError.message
          ? submitError.message
          : "Connexion impossible. Verifiez vos identifiants ou reessayez.";
      setErrorMessage(resolveAuthErrorMessage(message));
      setPendingIntent(null);
    }
  }

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary-fixed-dim selection:text-on-primary-fixed">
      <main className="min-h-screen px-4 pb-20 pt-12 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h1 className="mb-4 font-headline text-5xl font-bold tracking-tight text-primary md:text-6xl">
              {messages.auth.title}
            </h1>
            <p className="mx-auto max-w-xl text-sm font-body text-lg uppercase tracking-[0.1em] text-secondary">
              {messages.auth.subtitle}
            </p>
            {errorMessage ? (
              <div className="mt-8 inline-block rounded-xl bg-error-container p-4 text-on-error-container" role="alert">
                {errorMessage}
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-outline-variant/20 shadow-[0_48px_64px_rgba(27,28,25,0.06)] lg:grid-cols-2">
            <section className="flex flex-col justify-center bg-surface p-8 md:p-12 lg:p-16">
              <div className="mx-auto w-full max-w-md">
                <div className="mb-10">
                  <h2 className="mb-2 font-headline text-4xl font-bold text-primary">{messages.auth.loginTitle}</h2>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{messages.auth.loginSubtitle}</p>
                </div>
                <form className="space-y-6" onSubmit={handleAuthSubmit}>
                  <input name="next" type="hidden" value={nextPath} />
                  <input name="intent" type="hidden" value="login" />

                  <div className="space-y-6">
                    <div className="relative">
                      <label className="mb-2 block font-label text-[10px] font-bold uppercase tracking-[0.2em] text-outline/80">
                        {messages.auth.usernameOrEmail}
                      </label>
                      <input
                        name="email"
                        className="w-full border border-outline-variant/50 bg-white px-4 py-4 font-body text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-0"
                        placeholder="votre@email.com"
                        type="email"
                        required
                      />
                    </div>
                    <div className="relative">
                      <label className="mb-2 block font-label text-[10px] font-bold uppercase tracking-[0.2em] text-outline/80">
                        {messages.auth.password}
                      </label>
                      <input
                        name="password"
                        className="w-full border border-outline-variant/50 bg-white px-4 py-4 font-body text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-0"
                        placeholder="********"
                        type="password"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <label className="group flex cursor-pointer items-center gap-3">
                      <div className="relative flex h-5 w-5 items-center justify-center rounded-sm border border-outline-variant/50 bg-white transition-colors group-hover:border-primary">
                        <input className="peer absolute h-full w-full cursor-pointer opacity-0" type="checkbox" />
                        <span className="material-symbols-outlined text-sm text-primary opacity-0 transition-opacity peer-checked:opacity-100">
                          check
                        </span>
                      </div>
                      <span className="font-label text-[11px] uppercase tracking-wide text-secondary">
                        {messages.auth.rememberMe}
                      </span>
                    </label>
                    <button
                      type="button"
                      className="font-label text-[11px] font-bold uppercase tracking-widest text-primary transition-opacity hover:opacity-70"
                    >
                      {messages.auth.forgotPassword}
                    </button>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-outline-variant/20 bg-surface-container-low p-5">
                    <div className="flex items-center gap-4">
                      <div className="h-5 w-5 rounded-full border-2 border-outline-variant/30" />
                      <span className="font-label text-[11px] uppercase tracking-widest text-secondary">
                        {messages.auth.securityCheck}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-xl text-outline/60">shield</span>
                  </div>

                  <button
                    className="w-full rounded-lg bg-primary py-5 font-label text-xs font-bold uppercase tracking-[0.3em] text-on-primary shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    type="submit"
                    disabled={pendingIntent !== null}
                  >
                    {pendingIntent === "login" ? messages.auth.loginLoading : messages.auth.loginButton}
                  </button>
                </form>

                <div className="relative mt-12">
                  <div aria-hidden="true" className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-outline-variant/20" />
                  </div>
                  <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.3em]">
                    <span className="bg-surface px-6 text-outline/40">{messages.auth.exclusiveExperience}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="relative overflow-hidden bg-surface-container-low p-8 md:p-12 lg:p-16">
              <div className="absolute right-0 top-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-primary-fixed-dim/10 blur-3xl" />
              <div className="relative z-10 mx-auto w-full max-w-md">
                <div className="mb-10 text-center">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
                    {messages.auth.signupEyebrow}
                  </p>
                  <div className="mx-auto h-[1px] w-12 bg-outline-variant/30" />
                </div>
                <form className="space-y-5" onSubmit={handleAuthSubmit}>
                  <input name="next" type="hidden" value={nextPath} />
                  <input name="intent" type="hidden" value="signup" />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="mb-1 block font-label text-[10px] font-bold uppercase tracking-[0.1em] text-outline/80">
                        {messages.auth.firstName}
                      </label>
                      <input
                        name="first_name"
                        className="w-full rounded border border-outline-variant/40 bg-white/50 px-3 py-3 font-body text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-0"
                        type="text"
                      />
                    </div>
                    <div className="relative">
                      <label className="mb-1 block font-label text-[10px] font-bold uppercase tracking-[0.1em] text-outline/80">
                        {messages.auth.lastName}
                      </label>
                      <input
                        name="last_name"
                        className="w-full rounded border border-outline-variant/40 bg-white/50 px-3 py-3 font-body text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-0"
                        type="text"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="mb-1 block font-label text-[10px] font-bold uppercase tracking-[0.1em] text-outline/80">
                      {messages.auth.email}
                    </label>
                    <input
                      name="email"
                      className="w-full rounded border border-outline-variant/40 bg-white/50 px-3 py-3 font-body text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-0"
                      type="email"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="mb-1 block font-label text-[10px] font-bold uppercase tracking-[0.1em] text-outline/80">
                        {messages.auth.birthDate}
                      </label>
                      <input
                        name="birth_date"
                        className="w-full rounded border border-outline-variant/40 bg-white/50 px-3 py-3 font-body text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-0"
                        type="text"
                        placeholder="mm/dd/yyyy"
                      />
                    </div>
                    <div className="relative">
                      <label className="mb-1 block font-label text-[10px] font-bold uppercase tracking-[0.1em] text-outline/80">
                        {messages.auth.phone}
                      </label>
                      <input
                        name="phone"
                        className="w-full rounded border border-outline-variant/40 bg-white/50 px-3 py-3 font-body text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-0"
                        type="tel"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="mb-1 block font-label text-[10px] font-bold uppercase tracking-[0.1em] text-outline/80">
                      {messages.auth.address}
                    </label>
                    <input
                      name="address"
                      className="w-full rounded border border-outline-variant/40 bg-white/50 px-3 py-3 font-body text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-0"
                      type="text"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="mb-1 block font-label text-[10px] font-bold uppercase tracking-[0.1em] text-outline/80">
                        {messages.auth.password}
                      </label>
                      <input
                        name="password"
                        className="w-full rounded border border-outline-variant/40 bg-white/50 px-3 py-3 font-body text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-0"
                        type="password"
                        required
                      />
                    </div>
                    <div className="relative">
                      <label className="mb-1 block font-label text-[10px] font-bold uppercase tracking-[0.1em] text-outline/80">
                        {messages.auth.confirmPassword}
                      </label>
                      <input
                        name="confirm_password"
                        className="w-full rounded border border-outline-variant/40 bg-white/50 px-3 py-3 font-body text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-0"
                        type="password"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-xl border border-outline-variant/20 bg-white/80 p-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-lg text-primary/40">verified_user</span>
                      <span className="font-label text-[10px] font-bold uppercase tracking-widest text-secondary">
                        {messages.auth.humanVerification}
                      </span>
                    </div>
                    <button
                      className="rounded-lg border border-primary/10 bg-primary/5 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary/10"
                      type="button"
                    >
                      {messages.auth.verify}
                    </button>
                  </div>

                  <button
                    className="mt-4 w-full rounded-lg border-2 border-primary py-5 font-label text-xs font-bold uppercase tracking-[0.3em] text-primary transition-all duration-300 hover:bg-primary hover:text-on-primary disabled:cursor-not-allowed disabled:opacity-60"
                    type="submit"
                    disabled={pendingIntent !== null}
                  >
                    {pendingIntent === "signup" ? messages.auth.signupLoading : messages.auth.signupButton}
                  </button>
                </form>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

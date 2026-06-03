"use client";

import Link from "next/link";
import { useActionState, useRef } from "react";

import { loginAction } from "@/app/actions";
import { TEST_CREDENTIALS } from "@/lib/test-credentials";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, undefined);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  function fillCredentials(username: string, password: string) {
    if (usernameRef.current) usernameRef.current.value = username;
    if (passwordRef.current) passwordRef.current.value = password;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10 sm:px-6">
      <section className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Login
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Sign in
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Enter your credentials or use a test account below.
        </p>

        {/* Test credential quick-fill */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
            Test accounts
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {TEST_CREDENTIALS.map((cred) => (
              <button
                key={cred.username}
                type="button"
                onClick={() => fillCredentials(cred.username, cred.password)}
                className="inline-flex flex-col items-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-slate-400 hover:bg-slate-50"
              >
                <span className="text-xs font-semibold capitalize text-slate-950">
                  {cred.role}
                </span>
                <span className="mt-0.5 font-mono text-xs text-slate-500">
                  {cred.username} / {cred.password}
                </span>
              </button>
            ))}
          </div>
        </div>

        <form action={action} className="mt-5 grid gap-4">
          {state?.error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {state.error}
            </div>
          ) : null}

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="username">
              Username
            </label>
            <input
              ref={usernameRef}
              id="username"
              name="username"
              autoComplete="username"
              placeholder="your-username"
              required
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <input
              ref={passwordRef}
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          No account?{" "}
          <Link
            href="/signup"
            className="font-medium text-slate-950 underline underline-offset-4"
          >
            Sign up
          </Link>
        </p>
      </section>
    </main>
  );
}

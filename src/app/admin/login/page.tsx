"use client";

import Image from "next/image";
import { useActionState } from "react";
import { login, type LoginState } from "../auth-actions";

const initialState: LoginState = {};

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-4 py-20">
      <Image src="/brand/flower-icon.png" alt="" width={67} height={54} className="h-14 w-auto" />
      <h1 className="mt-4 font-script text-4xl text-leaf">Admin</h1>

      <form action={formAction} className="mt-8 w-full space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-leaf-dark">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            className="w-full rounded-lg border border-sage bg-white px-4 py-2.5 text-sm focus:border-leaf focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-leaf-dark">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-sage bg-white px-4 py-2.5 text-sm focus:border-leaf focus:outline-none"
          />
        </div>
        {state.error && (
          <p className="rounded-lg bg-daisy/20 px-4 py-2 text-sm text-charcoal">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-olive px-8 py-3 font-semibold text-cream transition-colors hover:bg-olive-dark disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

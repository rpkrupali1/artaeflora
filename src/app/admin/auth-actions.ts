"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { db } from "@/lib/db";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const admin = await db.adminUser.findUnique({ where: { email } });
  // bcrypt.compare against a dummy hash when the user doesn't exist keeps
  // timing identical for unknown-email vs wrong-password.
  const hash = admin?.passwordHash ?? "$2b$10$invalidinvalidinvalidinvaliduBOG9C3XW3q5S9O";
  const valid = await bcrypt.compare(password, hash);

  if (!admin || !valid) {
    return { error: "Invalid email or password." };
  }

  const token = await createSessionToken(admin.email);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
  redirect("/admin");
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

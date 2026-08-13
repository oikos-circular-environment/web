"use server";

import { redirect } from "next/navigation";

import { signOut } from "@/lib/session";

export async function logoutAction(): Promise<void> {
  await signOut();
  redirect("/");
}

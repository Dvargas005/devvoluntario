"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-sm text-muted hover:text-fresh-mint transition-colors border-b border-border hover:border-fresh-mint/40 pb-0.5"
    >
      Cerrar sesión
    </button>
  );
}

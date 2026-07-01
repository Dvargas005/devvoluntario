"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authClient.signIn.magicLink({ email, callbackURL: "/" });
      setSent(true);
    } catch {
      setError("No se pudo enviar el enlace. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <main className="min-h-screen flex items-center justify-center p-s3">
        <div className="w-full max-w-sm text-center space-y-s3">
          <h1 className="font-serif text-2xl font-bold">Revisa tu correo</h1>
          <p className="text-muted">
            Enviamos un enlace de acceso a <strong className="text-foreground">{email}</strong>. Haz clic en
            él para entrar.
          </p>
          <button
            onClick={() => setSent(false)}
            className="text-sm text-fresh-mint hover:underline"
          >
            Usar otro correo
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-s3">
      <div className="w-full max-w-sm space-y-s5">
        <div className="text-center">
          <Link href="/" className="inline-block mb-s3">
            <span
              className="font-serif text-2xl font-bold"
              style={{ letterSpacing: "-0.03em" }}
            >
              DeVVoluntario
            </span>
          </Link>
          <h1 className="text-xl font-bold">Acceder</h1>
          <p className="text-muted text-sm mt-s1">
            Ingresa tu correo para recibir un enlace de acceso.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-s3">
          <input
            type="email"
            required
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-s2 py-s1 bg-surface text-foreground border border-border rounded-lg placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-fresh-mint/50 focus:border-fresh-mint/50"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-s1 bg-foreground text-bg font-medium rounded-lg hover:bg-muted disabled:opacity-50 transition-colors"
          >
            {loading ? "Enviando..." : "Enviar enlace mágico"}
          </button>
        </form>
      </div>
    </main>
  );
}

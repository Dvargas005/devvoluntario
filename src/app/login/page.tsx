"use client";

import { useState } from "react";
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
      await authClient.signIn.magicLink({ email });
      setSent(true);
    } catch {
      setError("No se pudo enviar el enlace. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 font-[family-name:var(--font-geist-sans)]">
        <div className="w-full max-w-sm text-center space-y-4">
          <h1 className="text-2xl font-bold">Revisa tu correo</h1>
          <p className="text-gray-600">
            Enviamos un enlace de acceso a <strong>{email}</strong>. Haz clic en
            él para entrar.
          </p>
          <button
            onClick={() => setSent(false)}
            className="text-sm text-blue-600 hover:underline"
          >
            Usar otro correo
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 font-[family-name:var(--font-geist-sans)]">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Acceder a Dev Voluntario</h1>
          <p className="text-gray-600 mt-2">
            Ingresa tu correo para recibir un enlace de acceso.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar enlace mágico"}
          </button>
        </form>
      </div>
    </main>
  );
}

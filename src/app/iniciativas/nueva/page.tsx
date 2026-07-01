import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth-server";
import { createInitiative } from "@/app/actions/initiatives";
import InitiativeForm from "@/components/InitiativeForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registrar iniciativa — DeVVoluntario",
};

export default async function NewInitiativePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <main className="min-h-screen px-s3 py-s5 lg:px-s7 lg:py-s7">
      <div className="max-w-2xl mx-auto">
        <nav className="mb-s5">
          <Link
            href="/"
            className="text-sm text-muted hover:text-fresh-mint transition-colors"
          >
            &larr; Volver al directorio
          </Link>
        </nav>

        <header className="mb-s5">
          <h1 className="font-serif text-3xl font-bold mb-s1">
            Registrar iniciativa
          </h1>
          <p className="text-muted text-sm">
            Agrega un proyecto al directorio. Todos los campos marcados con * son obligatorios.
          </p>
        </header>

        <InitiativeForm action={createInitiative} submitLabel="Registrar" />
      </div>
    </main>
  );
}

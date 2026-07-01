import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-server";
import { updateInitiative } from "@/app/actions/initiatives";
import InitiativeForm from "@/components/InitiativeForm";
import type { Metadata } from "next";

const UNVERIFIED_PREFIX = "[Datos por confirmar]";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const ini = await prisma.initiative.findUnique({
    where: { id: params.id },
    select: { name: true },
  });
  if (!ini) return { title: "No encontrada — DeVVoluntario" };
  return { title: `Editar ${ini.name} — DeVVoluntario` };
}

export default async function EditInitiativePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const initiative = await prisma.initiative.findUnique({
    where: { id: params.id },
  });
  if (!initiative) notFound();

  // Strip unverified prefix for the form
  const cleanDescription = initiative.description.startsWith(UNVERIFIED_PREFIX)
    ? initiative.description.slice(UNVERIFIED_PREFIX.length).trim()
    : initiative.description;

  return (
    <main className="min-h-screen px-s3 py-s5 lg:px-s7 lg:py-s7">
      <div className="max-w-2xl mx-auto">
        <nav className="mb-s5">
          <Link
            href={`/iniciativas/${initiative.id}`}
            className="text-sm text-muted hover:text-fresh-mint transition-colors"
          >
            &larr; Volver a {initiative.name}
          </Link>
        </nav>

        <header className="mb-s5">
          <h1 className="font-serif text-3xl font-bold mb-s1">
            Editar: {initiative.name}
          </h1>
          <p className="text-muted text-sm">
            Modelo wiki — cualquier usuario registrado puede editar. Los cambios
            quedan en el historial.
          </p>
        </header>

        <InitiativeForm
          action={updateInitiative}
          submitLabel="Guardar cambios"
          defaults={{
            id: initiative.id,
            name: initiative.name,
            tagline: initiative.tagline,
            description: cleanDescription,
            status: initiative.status,
            primaryCategory: initiative.primaryCategory,
            secondaryCats: initiative.secondaryCats,
            platforms: initiative.platforms,
            techStack: initiative.techStack,
            coverage: initiative.coverage,
            repoVisibility: initiative.repoVisibility,
            repoUrl: initiative.repoUrl,
            liveUrl: initiative.liveUrl,
            needsHelp: initiative.needsHelp,
            neededRoles: initiative.neededRoles,
          }}
        />
      </div>
    </main>
  );
}

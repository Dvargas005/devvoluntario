import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-server";
import { upsertVolunteer } from "@/app/actions/volunteers";
import { DEVROLE_LABELS } from "@/lib/labels";
import VolunteerForm from "@/components/VolunteerForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voluntarios — DeVVoluntario",
  description: "Directorio de voluntarios e iniciativas que necesitan apoyo",
};

export const dynamic = "force-dynamic";

export default async function VoluntariosPage() {
  const session = await getSession();

  const [helpNeeded, volunteers, myVolunteer] = await Promise.all([
    prisma.initiative.findMany({
      where: { needsHelp: true },
      select: {
        id: true,
        name: true,
        tagline: true,
        neededRoles: true,
        status: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.volunteer.findMany({
      where: { listedPublicly: true },
      select: {
        id: true,
        displayName: true,
        roles: true,
        skills: true,
        availability: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    session
      ? prisma.volunteer.findUnique({
          where: { userId: session.user.id },
        })
      : null,
  ]);

  return (
    <main className="min-h-screen px-s3 py-s5 lg:px-s7 lg:py-s7">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-s5">
          <Link
            href="/"
            className="text-sm text-muted hover:text-fresh-mint transition-colors"
          >
            &larr; Volver al directorio
          </Link>
        </nav>

        <header className="mb-s7">
          <h1 className="font-serif text-3xl lg:text-4xl font-bold mb-s2">
            Voluntarios
          </h1>
          <p className="text-muted leading-relaxed">
            Iniciativas que necesitan apoyo y personas disponibles para ayudar.
          </p>
        </header>

        {/* ─── Initiatives needing help ─── */}
        <section className="mb-s7">
          <h2 className="font-serif text-xl font-bold mb-s3">
            Buscan voluntarios
          </h2>
          {helpNeeded.length === 0 ? (
            <p className="text-muted/60 text-sm">
              Ninguna iniciativa necesita apoyo en este momento.
            </p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-s3">
              {helpNeeded.map((ini) => (
                <li key={ini.id}>
                  <Link
                    href={`/iniciativas/${ini.id}`}
                    className="block border border-border rounded-lg p-s3 hover:bg-surface-hover hover:border-fresh-mint/20 transition-colors"
                  >
                    <h3 className="font-serif font-bold text-lg mb-1">
                      {ini.name}
                    </h3>
                    {ini.tagline && (
                      <p className="text-muted text-sm mb-s2 line-clamp-2">
                        {ini.tagline}
                      </p>
                    )}
                    {ini.neededRoles.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {ini.neededRoles.map((role) => (
                          <span
                            key={role}
                            className="text-[10px] text-fresh-mint/70 bg-fresh-mint/5 border border-fresh-mint/20 px-1.5 py-0.5 rounded"
                          >
                            {DEVROLE_LABELS[role] ?? role}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ─── Public volunteers ─── */}
        <section className="border-t border-border pt-s5 mb-s7">
          <h2 className="font-serif text-xl font-bold mb-s3">
            Voluntarios disponibles
          </h2>
          {volunteers.length === 0 ? (
            <p className="text-muted/60 text-sm">
              Aún no hay voluntarios registrados.
            </p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-s3">
              {volunteers.map((vol) => (
                <li
                  key={vol.id}
                  className="border border-border rounded-lg p-s3"
                >
                  <p className="font-bold mb-1">{vol.displayName}</p>
                  <div className="flex flex-wrap gap-1 mb-s1">
                    {vol.roles.map((role) => (
                      <span
                        key={role}
                        className="text-[10px] text-fresh-mint border border-fresh-mint/30 px-1.5 py-0.5 rounded"
                      >
                        {DEVROLE_LABELS[role] ?? role}
                      </span>
                    ))}
                  </div>
                  {vol.skills.length > 0 && (
                    <p className="text-xs text-muted/60">
                      {vol.skills.join(", ")}
                    </p>
                  )}
                  {vol.availability && (
                    <p className="text-xs text-muted/40 mt-1">
                      {vol.availability}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ─── Volunteer form ─── */}
        <section className="border-t border-border pt-s5">
          <h2 className="font-serif text-xl font-bold mb-s3">
            {myVolunteer ? "Editar tu perfil de voluntario" : "Ofrecerte como voluntario"}
          </h2>
          {session ? (
            <VolunteerForm action={upsertVolunteer} defaults={myVolunteer} />
          ) : (
            <div className="border border-dashed border-border rounded-lg p-s5 text-center">
              <p className="text-muted mb-s2">
                Inicia sesión para registrarte como voluntario.
              </p>
              <Link
                href="/login"
                className="text-sm text-fresh-mint hover:underline"
              >
                Acceder
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

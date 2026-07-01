import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-server";
import { upsertVolunteer } from "@/app/actions/volunteers";
import { DEVROLE_LABELS } from "@/lib/labels";
import VolunteerForm from "@/components/VolunteerForm";
import type { Metadata } from "next";
import type { DevRole } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Voluntarios — DeVVoluntario",
  description: "Motor de match anónimo entre iniciativas y voluntarios",
};

export const dynamic = "force-dynamic";

export default async function VoluntariosPage() {
  const session = await getSession();

  const [helpNeeded, allVolunteers, myVolunteer] = await Promise.all([
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
      select: { roles: true },
    }),
    session
      ? prisma.volunteer.findUnique({
          where: { userId: session.user.id },
          select: {
            roles: true,
            skills: true,
            availability: true,
            contactPref: true,
          },
        })
      : null,
  ]);

  // Aggregate counts by role
  const totalVolunteers = allVolunteers.length;
  const countByRole: Record<string, number> = {};
  for (const vol of allVolunteers) {
    for (const role of vol.roles) {
      countByRole[role] = (countByRole[role] || 0) + 1;
    }
  }

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
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold mb-s2">
            Voluntarios
          </h1>
          <p className="text-muted leading-relaxed text-sm sm:text-base">
            Motor de match anónimo: conectamos iniciativas que necesitan apoyo
            con voluntarios disponibles por especialidad. Sin exponer identidades.
          </p>
        </header>

        {/* ─── Volunteer counter panel ─── */}
        <section className="mb-s7">
          <h2 className="font-serif text-xl font-bold mb-s3">
            Voluntarios registrados
          </h2>
          <div className="border border-border rounded-lg p-s3 sm:p-s4">
            <div className="flex items-baseline gap-2 mb-s3">
              <span className="font-serif text-3xl font-bold text-fresh-mint">
                {totalVolunteers}
              </span>
              <span className="text-muted text-sm">
                voluntario{totalVolunteers !== 1 ? "s" : ""} en total
              </span>
            </div>

            {totalVolunteers > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {Object.entries(DEVROLE_LABELS).map(([role, label]) => {
                  const count = countByRole[role] || 0;
                  return (
                    <div
                      key={role}
                      className="flex items-center justify-between gap-2 border border-border/50 rounded-lg px-s2 py-1.5"
                    >
                      <span className="text-xs text-muted/80 truncate">
                        {label}
                      </span>
                      <span
                        className={`text-sm font-bold shrink-0 ${
                          count > 0 ? "text-fresh-mint" : "text-muted/30"
                        }`}
                      >
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted/60 text-sm">
                Aún no hay voluntarios registrados.
              </p>
            )}

            <p className="text-[11px] text-muted/40 mt-s2">
              Solo números agregados — nunca se exponen nombres ni datos personales.
            </p>
          </div>
        </section>

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
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-s3">
              {helpNeeded.map((ini) => (
                <li key={ini.id}>
                  <Link
                    href={`/iniciativas/${ini.id}`}
                    className="block border border-border rounded-lg p-s3 hover:bg-surface-hover hover:border-fresh-mint/20 transition-colors"
                  >
                    <h3 className="font-serif font-bold text-base sm:text-lg mb-1 break-words">
                      {ini.name}
                    </h3>
                    {ini.tagline && (
                      <p className="text-muted text-sm mb-s2 line-clamp-2">
                        {ini.tagline}
                      </p>
                    )}
                    {ini.neededRoles.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {ini.neededRoles.map((role: DevRole) => (
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

        {/* ─── Volunteer form ─── */}
        <section className="border-t border-border pt-s5">
          <h2 className="font-serif text-xl font-bold mb-s3">
            {myVolunteer
              ? "Editar tu perfil de voluntario"
              : "Ofrecerte como voluntario"}
          </h2>
          {session ? (
            <VolunteerForm action={upsertVolunteer} defaults={myVolunteer} />
          ) : (
            <div className="border border-dashed border-border rounded-lg p-s4 sm:p-s5 text-center">
              <p className="text-muted mb-s2 text-sm sm:text-base">
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

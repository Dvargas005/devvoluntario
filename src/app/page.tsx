import Link from "next/link";
import { prisma } from "@/lib/db";
import CircularText from "@/components/CircularText";

const CATEGORY_LABELS: Record<string, string> = {
  RESCUE_SEARCH: "Rescate y búsqueda",
  MISSING_PERSONS: "Personas desaparecidas",
  SHELTERS: "Refugios y albergues",
  DONATIONS_LOGISTICS: "Donaciones e insumos",
  HEALTH_TELEMEDICINE: "Salud y telemedicina",
  DAMAGE_MAPPING: "Mapeo de daños",
  INFO_COMMS: "Comunicación e info",
  VOLUNTEERING: "Voluntariado",
  FAMILY_REUNIFICATION: "Reunificación familiar",
  OPEN_DATA_INFRA: "Datos abiertos / infra",
};

const STATUS_LABELS: Record<string, string> = {
  IDEA: "Idea",
  IN_DEVELOPMENT: "En desarrollo",
  IN_PRODUCTION: "En producción",
  PAUSED: "Pausado",
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const initiatives = await prisma.initiative.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      tagline: true,
      status: true,
      primaryCategory: true,
      needsHelp: true,
      platforms: true,
    },
  });

  return (
    <main className="min-h-screen">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* ─── Columna izquierda: sticky sidebar ─── */}
        <aside className="w-full lg:w-[320px] xl:w-[360px] shrink-0 px-s3 py-s5 lg:px-s5 lg:py-s7 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto border-b lg:border-b-0 lg:border-r border-border">
          <div className="flex flex-col gap-s5 lg:gap-s7 max-w-md mx-auto lg:max-w-none">
            {/* Logo */}
            <div>
              <Link href="/" className="block">
                <h1
                  className="font-serif text-4xl lg:text-5xl font-bold tracking-tight"
                  style={{ letterSpacing: "-0.06em" }}
                >
                  DeVVoluntario
                </h1>
              </Link>
            </div>

            {/* Descripción */}
            <p className="text-muted text-base leading-relaxed max-w-[28ch] lg:max-w-none">
              Directorio de iniciativas tecnológicas en respuesta al doblete
              sísmico de Venezuela.
            </p>

            {/* Acciones */}
            <div className="flex gap-s2">
              <Link
                href="/login"
                className="text-sm text-muted hover:text-foreground transition-colors border-b border-border hover:border-foreground pb-0.5"
              >
                Acceder
              </Link>
            </div>

            {/* Sello circular giratorio */}
            <div className="hidden lg:flex justify-center py-s3">
              <CircularText
                text="UNIDOS POR VENEZUELA * GRUPO TECNOLOGIA Y COMUNICACION TERREMOTO * "
                spinDuration={20}
                onHover="speedUp"
              />
            </div>
          </div>
        </aside>

        {/* ─── Columnas 2-3-4: grid de iniciativas ─── */}
        <section className="flex-1 px-s3 py-s5 lg:px-s7 lg:py-s7">
          <div className="max-w-5xl">
            <header className="mb-s5 lg:mb-s7">
              <h2 className="font-serif text-2xl lg:text-3xl font-bold">
                Iniciativas
              </h2>
              <p className="text-muted text-sm mt-s1">
                Proyectos tecnológicos activos tras el terremoto
              </p>
            </header>

            {initiatives.length === 0 ? (
              <div className="border border-dashed border-border rounded-lg p-s7 lg:p-s9 text-center">
                <p className="text-muted text-lg mb-s2">
                  Aún no hay iniciativas registradas.
                </p>
                <p className="text-sm text-muted/60">
                  Sé el primero en agregar una iniciativa al directorio.
                </p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-s3 lg:gap-s4">
                {initiatives.map((ini) => (
                  <li key={ini.id}>
                    <article className="group border border-border rounded-lg p-s3 lg:p-s4 hover:bg-surface-hover transition-colors h-full flex flex-col">
                      <div className="flex items-start justify-between gap-s2 mb-s2">
                        <h3 className="font-serif font-bold text-lg leading-snug">
                          {ini.name}
                        </h3>
                        {ini.needsHelp && (
                          <span className="shrink-0 text-xs text-fresh-mint border border-fresh-mint/30 px-2 py-0.5 rounded-full">
                            Necesita apoyo
                          </span>
                        )}
                      </div>

                      {ini.tagline && (
                        <p className="text-muted text-sm leading-relaxed mb-s3 flex-1">
                          {ini.tagline}
                        </p>
                      )}

                      <div className="flex gap-2 flex-wrap mt-auto">
                        <span className="text-xs text-muted/80 border border-border px-2 py-0.5 rounded">
                          {CATEGORY_LABELS[ini.primaryCategory] ??
                            ini.primaryCategory}
                        </span>
                        <span className="text-xs text-slate-blue border border-slate-blue/30 px-2 py-0.5 rounded">
                          {STATUS_LABELS[ini.status] ?? ini.status}
                        </span>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* Sello circular solo visible en mobile (abajo del contenido) */}
      <div className="flex lg:hidden justify-center py-s7 border-t border-border">
        <CircularText
          text="UNIDOS POR VENEZUELA * GRUPO TECNOLOGIA Y COMUNICACION TERREMOTO * "
          spinDuration={20}
          onHover="speedUp"
        />
      </div>
    </main>
  );
}

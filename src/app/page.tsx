import Link from "next/link";
import { prisma } from "@/lib/db";

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
    <main className="min-h-screen p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
      <header className="max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl font-bold">Dev Voluntario</h1>
        <p className="text-gray-600 mt-2">
          Directorio de iniciativas tecnológicas en respuesta al doblete sísmico
          de Venezuela.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm"
          >
            Acceder
          </Link>
        </div>
      </header>

      <section className="max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Iniciativas</h2>

        {initiatives.length === 0 ? (
          <div className="border border-dashed rounded-lg p-8 text-center text-gray-500">
            <p className="text-lg mb-2">Aún no hay iniciativas registradas.</p>
            <p className="text-sm">
              Sé el primero en agregar una iniciativa al directorio.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {initiatives.map((ini) => (
              <li key={ini.id}>
                <div className="border rounded-lg p-4 hover:border-gray-400 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{ini.name}</h3>
                      {ini.tagline && (
                        <p className="text-gray-600 text-sm mt-1">
                          {ini.tagline}
                        </p>
                      )}
                    </div>
                    {ini.needsHelp && (
                      <span className="shrink-0 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                        Necesita apoyo
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {CATEGORY_LABELS[ini.primaryCategory] ??
                        ini.primaryCategory}
                    </span>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                      {STATUS_LABELS[ini.status] ?? ini.status}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

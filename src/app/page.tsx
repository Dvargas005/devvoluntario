import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  PLATFORM_LABELS,
  DEVROLE_LABELS,
} from "@/lib/labels";

import FilterBar from "@/components/FilterBar";
import type { Prisma } from "@/generated/prisma/client";

const UNVERIFIED_PREFIX = "[Datos por confirmar]";
const PAGE_SIZE = 12;

export const dynamic = "force-dynamic";

function buildWhere(params: Record<string, string | undefined>): Prisma.InitiativeWhereInput {
  const where: Prisma.InitiativeWhereInput = {};

  if (params.category) {
    where.primaryCategory = params.category as never;
  }
  if (params.status) {
    where.status = params.status as never;
  }
  if (params.repo === "public") {
    where.repoVisibility = "PUBLIC";
  } else if (params.repo === "none") {
    where.repoVisibility = { in: ["NONE", "PRIVATE"] };
  }
  if (params.platform) {
    where.platforms = { has: params.platform as never };
  }
  if (params.help === "true") {
    where.needsHelp = true;
    if (params.role) {
      where.neededRoles = { has: params.role as never };
    }
  } else if (params.help === "false") {
    where.needsHelp = false;
  }
  if (params.region) {
    where.coverage = { has: params.region as never };
  }
  if (params.q) {
    const q = params.q;
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { tagline: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  return where;
}

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Normalize searchParams to simple strings
  const params: Record<string, string | undefined> = {};
  for (const key of [
    "category",
    "status",
    "repo",
    "platform",
    "help",
    "role",
    "region",
    "q",
    "page",
  ]) {
    const val = searchParams[key];
    params[key] = Array.isArray(val) ? val[0] : val;
  }

  const page = Math.max(1, parseInt(params.page || "1", 10));
  const where = buildWhere(params);

  const [initiatives, totalCount] = await Promise.all([
    prisma.initiative.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        tagline: true,
        description: true,
        status: true,
        primaryCategory: true,
        platforms: true,
        needsHelp: true,
        neededRoles: true,
        liveUrl: true,
      },
    }),
    prisma.initiative.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Build pagination href
  function pageHref(p: number): string {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v && k !== "page") next.set(k, v);
    }
    if (p > 1) next.set("page", String(p));
    const qs = next.toString();
    return qs ? `/?${qs}` : "/";
  }

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
                  className="font-serif text-2xl sm:text-3xl lg:text-[2.15rem] font-bold"
                  style={{ letterSpacing: "-0.08em" }}
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
                className="text-sm text-muted hover:text-fresh-mint transition-colors border-b border-border hover:border-fresh-mint/40 pb-0.5"
              >
                Acceder
              </Link>
            </div>

          </div>
        </aside>

        {/* ─── Columnas 2-3-4: grid de iniciativas ─── */}
        <section className="flex-1 px-s3 py-s5 lg:px-s7 lg:py-s7">
          <div className="max-w-5xl">
            <header className="mb-s4 lg:mb-s5">
              <h2 className="font-serif text-2xl lg:text-3xl font-bold">
                Iniciativas
              </h2>
              <p className="text-muted text-sm mt-s1">
                {totalCount} proyecto{totalCount !== 1 ? "s" : ""} registrado
                {totalCount !== 1 ? "s" : ""}
              </p>
            </header>

            {/* Filtros */}
            <Suspense fallback={null}>
              <FilterBar />
            </Suspense>

            {/* Grid de cards */}
            {initiatives.length === 0 ? (
              <div className="border border-dashed border-border rounded-lg p-s7 lg:p-s9 text-center">
                <p className="text-muted text-lg mb-s2">
                  No se encontraron iniciativas con estos filtros.
                </p>
                <p className="text-sm text-muted/60 mb-s3">
                  Prueba ajustar o limpiar los filtros.
                </p>
                <Link
                  href="/"
                  className="text-sm text-fresh-mint hover:underline"
                >
                  Ver todas las iniciativas
                </Link>
              </div>
            ) : (
              <>
                <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-s3 lg:gap-s4">
                  {initiatives.map((ini) => {
                    const isUnverified =
                      ini.description.startsWith(UNVERIFIED_PREFIX);
                    return (
                      <li key={ini.id}>
                          <article className="group relative border border-border rounded-lg p-s3 lg:p-s4 hover:bg-surface-hover hover:border-fresh-mint/20 transition-colors h-full flex flex-col">
                            {/* Header: nombre + badges + external link */}
                            <div className="flex items-start justify-between gap-s1 mb-s1">
                              <h3 className="font-serif font-bold text-lg leading-snug group-hover:text-fresh-mint transition-colors">
                                <Link
                                  href={`/iniciativas/${ini.id}`}
                                  className="after:content-[''] after:absolute after:inset-0"
                                >
                                  {ini.name}
                                </Link>
                              </h3>
                              <div className="flex items-start gap-1.5 shrink-0">
                                <div className="flex flex-col items-end gap-1">
                                  {ini.needsHelp && (
                                    <span className="text-[11px] text-fresh-mint border border-fresh-mint/30 px-2 py-0.5 rounded-full whitespace-nowrap">
                                      Necesita apoyo
                                    </span>
                                  )}
                                  {isUnverified && (
                                    <span className="text-[11px] text-slate-blue border border-slate-blue/30 px-2 py-0.5 rounded-full whitespace-nowrap">
                                      Por confirmar
                                    </span>
                                  )}
                                </div>
                                {ini.liveUrl && (
                                  <a
                                    href={ini.liveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Abrir sitio en pestaña nueva"
                                    className="relative z-10 p-1 text-muted/40 hover:text-fresh-mint transition-colors"
                                  >
                                    <svg
                                      width="14"
                                      height="14"
                                      viewBox="0 0 14 14"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M5.5 3H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V8.5M8 2h4v4M12 2L6.5 7.5" />
                                    </svg>
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Tagline */}
                            {ini.tagline && (
                              <p className="text-muted text-sm leading-relaxed mb-s2 flex-1">
                                {ini.tagline}
                              </p>
                            )}
                            {!ini.tagline && <div className="flex-1" />}

                            {/* Roles necesarios */}
                            {ini.needsHelp && ini.neededRoles.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-s2">
                                {ini.neededRoles.map((role) => (
                                  <span
                                    key={role}
                                    className="text-[10px] text-fresh-mint/70 bg-fresh-mint/5 px-1.5 py-0.5 rounded"
                                  >
                                    {DEVROLE_LABELS[role] ?? role}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Footer: categoría + estado + plataformas */}
                            <div className="flex gap-1.5 flex-wrap mt-auto pt-s1 border-t border-border/50">
                              <span className="text-[11px] text-fresh-mint/70 border border-forest-green/40 px-2 py-0.5 rounded">
                                {CATEGORY_LABELS[ini.primaryCategory] ??
                                  ini.primaryCategory}
                              </span>
                              <span className="text-[11px] text-slate-blue border border-slate-blue/30 px-2 py-0.5 rounded">
                                {STATUS_LABELS[ini.status] ?? ini.status}
                              </span>
                              {ini.platforms.map((p) => (
                                <span
                                  key={p}
                                  className="text-[11px] text-muted/60 border border-border/50 px-2 py-0.5 rounded"
                                >
                                  {PLATFORM_LABELS[p] ?? p}
                                </span>
                              ))}
                            </div>
                          </article>
                      </li>
                    );
                  })}
                </ul>

                {/* Paginación */}
                {totalPages > 1 && (
                  <nav className="flex items-center justify-center gap-s2 mt-s5">
                    {page > 1 && (
                      <Link
                        href={pageHref(page - 1)}
                        className="text-sm text-muted hover:text-fresh-mint transition-colors px-3 py-1.5 border border-border rounded-lg hover:border-fresh-mint/30"
                      >
                        Anterior
                      </Link>
                    )}
                    <span className="text-sm text-muted/60">
                      {page} / {totalPages}
                    </span>
                    {page < totalPages && (
                      <Link
                        href={pageHref(page + 1)}
                        className="text-sm text-muted hover:text-fresh-mint transition-colors px-3 py-1.5 border border-border rounded-lg hover:border-fresh-mint/30"
                      >
                        Siguiente
                      </Link>
                    )}
                  </nav>
                )}
              </>
            )}
          </div>
        </section>
      </div>

    </main>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  PLATFORM_LABELS,
  DEVROLE_LABELS,
  REGION_LABELS,
} from "@/lib/labels";
import type { Metadata } from "next";

const UNVERIFIED_PREFIX = "[Datos por confirmar]";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const ini = await prisma.initiative.findUnique({
    where: { id: params.id },
    select: { name: true, tagline: true },
  });
  if (!ini) return { title: "No encontrada — DeVVoluntario" };
  return {
    title: `${ini.name} — DeVVoluntario`,
    description: ini.tagline || undefined,
  };
}

export default async function InitiativeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const initiative = await prisma.initiative.findUnique({
    where: { id: params.id },
    include: {
      createdBy: { select: { displayName: true } },
      owner: { select: { displayName: true } },
      audit: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: { select: { displayName: true } } },
      },
    },
  });

  if (!initiative) notFound();

  const isUnverified = initiative.description.startsWith(UNVERIFIED_PREFIX);
  const cleanDescription = isUnverified
    ? initiative.description.slice(UNVERIFIED_PREFIX.length).trim()
    : initiative.description;

  // ─── Solapamientos: misma categoría y/o misma zona ───
  const [sameCategory, sameRegion] = await Promise.all([
    prisma.initiative.findMany({
      where: {
        primaryCategory: initiative.primaryCategory,
        id: { not: initiative.id },
      },
      select: { id: true, name: true, status: true, liveUrl: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    initiative.coverage.length > 0
      ? prisma.initiative.findMany({
          where: {
            coverage: { hasSome: initiative.coverage },
            id: { not: initiative.id },
          },
          select: { id: true, name: true, status: true, coverage: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        })
      : Promise.resolve([]),
  ]);

  // Deduplicate sameRegion (remove those already in sameCategory)
  const sameCategoryIds = new Set(sameCategory.map((i) => i.id));
  const uniqueSameRegion = sameRegion.filter((i) => !sameCategoryIds.has(i.id));

  return (
    <main className="min-h-screen px-s3 py-s5 lg:px-s7 lg:py-s7">
      <div className="max-w-3xl mx-auto">
        {/* Nav */}
        <nav className="mb-s5">
          <Link
            href="/"
            className="text-sm text-muted hover:text-fresh-mint transition-colors"
          >
            &larr; Volver al directorio
          </Link>
        </nav>

        {/* Unverified banner */}
        {isUnverified && (
          <div className="border border-slate-blue/30 rounded-lg px-s3 py-s2 mb-s4 text-sm text-slate-blue">
            Datos por confirmar — si eres el autor, podrás corregirlos al
            iniciar sesión.
          </div>
        )}

        {/* Header */}
        <header className="mb-s5">
          <h1 className="font-serif text-3xl lg:text-4xl font-bold mb-s2">
            {initiative.name}
          </h1>
          {initiative.tagline && (
            <p className="text-muted text-lg leading-relaxed">
              {initiative.tagline}
            </p>
          )}
          {initiative.liveUrl && (
            <a
              href={initiative.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-s3 px-s3 py-s1 text-sm font-medium bg-forest-green text-foreground rounded-lg hover:bg-fresh-mint/20 transition-colors"
            >
              Ir al sitio
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
        </header>

        {/* Badges row */}
        <div className="flex flex-wrap gap-2 mb-s5">
          <span className="text-xs border border-forest-green/40 px-2.5 py-1 rounded-full text-fresh-mint/70">
            {CATEGORY_LABELS[initiative.primaryCategory] ??
              initiative.primaryCategory}
          </span>
          {initiative.secondaryCats.map((cat) => (
            <span
              key={cat}
              className="text-xs border border-border/50 px-2.5 py-1 rounded-full text-muted/60"
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </span>
          ))}
          <span className="text-xs border border-slate-blue/30 px-2.5 py-1 rounded-full text-slate-blue">
            {STATUS_LABELS[initiative.status] ?? initiative.status}
          </span>
          {initiative.platforms.map((p) => (
            <span
              key={p}
              className="text-xs border border-border/50 px-2.5 py-1 rounded-full text-muted/60"
            >
              {PLATFORM_LABELS[p] ?? p}
            </span>
          ))}
          {initiative.needsHelp && (
            <span className="text-xs border border-fresh-mint/30 px-2.5 py-1 rounded-full text-fresh-mint">
              Necesita apoyo
            </span>
          )}
          {isUnverified && (
            <span className="text-xs border border-slate-blue/30 px-2.5 py-1 rounded-full text-slate-blue">
              Por confirmar
            </span>
          )}
        </div>

        {/* Description */}
        <section className="mb-s7">
          <h2 className="text-sm text-muted/60 uppercase tracking-wider mb-s2">
            Descripción
          </h2>
          <p className="text-foreground leading-relaxed whitespace-pre-line">
            {cleanDescription}
          </p>
        </section>

        {/* Details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-s4 mb-s7">
          {/* Enlaces */}
          <DetailSection title="Enlaces">
            {initiative.liveUrl && (
              <DetailLink
                label="Sitio"
                href={initiative.liveUrl}
              />
            )}
            {initiative.repoVisibility === "PUBLIC" && initiative.repoUrl && (
              <DetailLink
                label="Repositorio"
                href={initiative.repoUrl}
              />
            )}
            {!initiative.liveUrl &&
              !(
                initiative.repoVisibility === "PUBLIC" && initiative.repoUrl
              ) && <p className="text-muted/60 text-sm">Sin enlaces públicos</p>}
          </DetailSection>

          {/* Cobertura */}
          <DetailSection title="Cobertura">
            {initiative.coverage.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {initiative.coverage.map((r) => (
                  <span
                    key={r}
                    className="text-xs border border-border px-2 py-0.5 rounded text-muted/80"
                  >
                    {REGION_LABELS[r] ?? r}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted/60 text-sm">Sin cobertura definida</p>
            )}
          </DetailSection>

          {/* Stack */}
          <DetailSection title="Tech Stack">
            {initiative.techStack.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {initiative.techStack.map((t) => (
                  <span
                    key={t}
                    className="text-xs border border-border px-2 py-0.5 rounded text-muted/80"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted/60 text-sm">Sin datos de stack</p>
            )}
          </DetailSection>

          {/* Roles necesarios */}
          {initiative.needsHelp && (
            <DetailSection title="Roles que buscan">
              {initiative.neededRoles.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {initiative.neededRoles.map((role) => (
                    <span
                      key={role}
                      className="text-xs text-fresh-mint border border-fresh-mint/30 px-2 py-0.5 rounded"
                    >
                      {DEVROLE_LABELS[role] ?? role}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-fresh-mint/70 text-sm">
                  Abierta a cualquier rol
                </p>
              )}
            </DetailSection>
          )}
        </div>

        {/* Autor (anti-doxeo: solo displayName) */}
        <div className="text-sm text-muted/60 mb-s7">
          Registrada por{" "}
          <span className="text-muted">
            {initiative.createdBy.displayName || "Anónimo"}
          </span>
          {initiative.owner &&
            initiative.owner.displayName !==
              initiative.createdBy.displayName && (
              <>
                {" · "}
                Mantenida por{" "}
                <span className="text-muted">
                  {initiative.owner.displayName || "Anónimo"}
                </span>
              </>
            )}
        </div>

        {/* ─── Solapamientos ─── */}
        {(sameCategory.length > 0 || uniqueSameRegion.length > 0) && (
          <section className="border-t border-border pt-s5 mb-s7">
            <h2 className="font-serif text-xl font-bold mb-s3">
              Iniciativas relacionadas
            </h2>

            {sameCategory.length > 0 && (
              <div className="mb-s4">
                <h3 className="text-sm text-muted/60 uppercase tracking-wider mb-s2">
                  Misma categoría:{" "}
                  {CATEGORY_LABELS[initiative.primaryCategory]}
                </h3>
                <ul className="space-y-2">
                  {sameCategory.map((rel) => (
                    <li key={rel.id}>
                      <Link
                        href={`/iniciativas/${rel.id}`}
                        className="flex items-center justify-between gap-s2 px-s2 py-s1 rounded-lg hover:bg-surface-hover transition-colors group"
                      >
                        <span className="text-sm group-hover:text-fresh-mint transition-colors">
                          {rel.name}
                        </span>
                        <span className="text-[11px] text-slate-blue border border-slate-blue/30 px-2 py-0.5 rounded shrink-0">
                          {STATUS_LABELS[rel.status] ?? rel.status}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {uniqueSameRegion.length > 0 && (
              <div>
                <h3 className="text-sm text-muted/60 uppercase tracking-wider mb-s2">
                  Misma zona
                </h3>
                <ul className="space-y-2">
                  {uniqueSameRegion.map((rel) => (
                    <li key={rel.id}>
                      <Link
                        href={`/iniciativas/${rel.id}`}
                        className="flex items-center justify-between gap-s2 px-s2 py-s1 rounded-lg hover:bg-surface-hover transition-colors group"
                      >
                        <span className="text-sm group-hover:text-fresh-mint transition-colors">
                          {rel.name}
                        </span>
                        <div className="flex gap-1 shrink-0">
                          {rel.coverage.map((r) => (
                            <span
                              key={r}
                              className="text-[11px] text-muted/60 border border-border/50 px-2 py-0.5 rounded"
                            >
                              {REGION_LABELS[r] ?? r}
                            </span>
                          ))}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* ─── Historial de cambios ─── */}
        {initiative.audit.length > 0 && (
          <section className="border-t border-border pt-s5">
            <h2 className="font-serif text-xl font-bold mb-s3">
              Historial de cambios
            </h2>
            <ul className="space-y-3">
              {initiative.audit.map((entry) => (
                <li
                  key={entry.id}
                  className="text-sm border-l-2 border-border pl-s2"
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-muted">
                      {entry.user.displayName || "Anónimo"}
                    </span>
                    <span className="text-muted/40">·</span>
                    <span className="text-muted/60">
                      {formatAction(entry.action)}
                    </span>
                  </div>
                  <time className="text-[11px] text-muted/40">
                    {new Date(entry.createdAt).toLocaleDateString("es-VE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}

// ─── Helper components ───

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm text-muted/60 uppercase tracking-wider mb-s1">
        {title}
      </h3>
      {children}
    </div>
  );
}

function DetailLink({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 text-sm text-muted hover:text-fresh-mint transition-colors mb-1"
    >
      <span>{label}:</span>
      <span className="truncate underline underline-offset-2">
        {href.replace(/^https?:\/\//, "").replace(/\/$/, "")}
      </span>
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="shrink-0"
      >
        <path d="M4.5 2.5h5v5M9.5 2.5L2.5 9.5" />
      </svg>
    </a>
  );
}

function formatAction(action: string): string {
  switch (action) {
    case "CREATE":
      return "Creó la iniciativa";
    case "UPDATE":
      return "Editó";
    case "CLAIM":
      return "Reclamó autoría";
    case "REVERT":
      return "Revirtió cambios";
    default:
      return action;
  }
}

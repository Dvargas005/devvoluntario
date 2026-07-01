"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  PLATFORM_LABELS,
  DEVROLE_LABELS,
  REGION_LABELS,
} from "@/lib/labels";

/** Build a new URL string by toggling a single query param value. */
function toggleParam(
  current: URLSearchParams,
  key: string,
  value: string
): string {
  const next = new URLSearchParams(current.toString());
  if (next.get(key) === value) {
    next.delete(key);
  } else {
    next.set(key, value);
  }
  // Reset to page 1 on filter change
  next.delete("page");
  const qs = next.toString();
  return qs ? `/?${qs}` : "/";
}

function FilterGroup({
  label,
  paramKey,
  options,
  current,
  onNavigate,
}: {
  label: string;
  paramKey: string;
  options: Record<string, string>;
  current: URLSearchParams;
  onNavigate: (href: string) => void;
}) {
  const activeValue = current.get(paramKey);
  return (
    <div>
      <p className="text-xs text-muted/60 mb-1.5 uppercase tracking-wider">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(options).map(([value, display]) => {
          const isActive = activeValue === value;
          const href = toggleParam(current, paramKey, value);
          return (
            <button
              key={value}
              onClick={() => onNavigate(href)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                isActive
                  ? "border-fresh-mint/50 text-fresh-mint bg-fresh-mint/10"
                  : "border-border text-muted/80 hover:border-muted/40 hover:text-foreground"
              }`}
            >
              {display}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const navigate = (href: string) => router.push(href, { scroll: false });

  const hasFilters =
    searchParams.get("category") ||
    searchParams.get("status") ||
    searchParams.get("repo") ||
    searchParams.get("platform") ||
    searchParams.get("help") ||
    searchParams.get("role") ||
    searchParams.get("region") ||
    searchParams.get("q");

  const filterCount = [
    "category",
    "status",
    "repo",
    "platform",
    "help",
    "role",
    "region",
    "q",
  ].filter((k) => searchParams.get(k)).length;

  // Search input
  const handleSearch = (value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      next.set("q", value.trim());
    } else {
      next.delete("q");
    }
    next.delete("page");
    const qs = next.toString();
    router.push(qs ? `/?${qs}` : "/", { scroll: false });
  };

  const filterContent = (
    <div className="space-y-s3">
      {/* Search */}
      <div>
        <input
          type="search"
          placeholder="Buscar por nombre o descripción..."
          defaultValue={searchParams.get("q") || ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch((e.target as HTMLInputElement).value);
            }
          }}
          onBlur={(e) => handleSearch(e.target.value)}
          className="w-full px-s2 py-s1 text-sm bg-surface text-foreground border border-border rounded-lg placeholder:text-muted/40 focus:outline-none focus:ring-1 focus:ring-fresh-mint/30 focus:border-fresh-mint/30"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-s3">
        <FilterGroup
          label="Categoría"
          paramKey="category"
          options={CATEGORY_LABELS}
          current={searchParams}
          onNavigate={navigate}
        />
        <FilterGroup
          label="Estado"
          paramKey="status"
          options={STATUS_LABELS}
          current={searchParams}
          onNavigate={navigate}
        />
        <FilterGroup
          label="Plataforma"
          paramKey="platform"
          options={PLATFORM_LABELS}
          current={searchParams}
          onNavigate={navigate}
        />
        <FilterGroup
          label="Repositorio"
          paramKey="repo"
          options={{ public: "Con repo público", none: "Sin repo" }}
          current={searchParams}
          onNavigate={navigate}
        />
        <FilterGroup
          label="Necesita apoyo"
          paramKey="help"
          options={{ true: "Sí", false: "No" }}
          current={searchParams}
          onNavigate={navigate}
        />
        {searchParams.get("help") === "true" && (
          <FilterGroup
            label="Rol necesario"
            paramKey="role"
            options={DEVROLE_LABELS}
            current={searchParams}
            onNavigate={navigate}
          />
        )}
        <FilterGroup
          label="Zona"
          paramKey="region"
          options={REGION_LABELS}
          current={searchParams}
          onNavigate={navigate}
        />
      </div>

      {hasFilters && (
        <button
          onClick={() => router.push("/", { scroll: false })}
          className="text-xs text-muted/60 hover:text-foreground transition-colors underline underline-offset-2"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );

  return (
    <div className="mb-s4 lg:mb-s5">
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-s2"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <line x1="2" y1="4" x2="14" y2="4" />
          <line x1="4" y1="8" x2="12" y2="8" />
          <line x1="6" y1="12" x2="10" y2="12" />
        </svg>
        Filtros{filterCount > 0 ? ` (${filterCount})` : ""}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="3,4.5 6,7.5 9,4.5" />
        </svg>
      </button>

      {/* Desktop: always visible. Mobile: toggle */}
      <div className={`${open ? "block" : "hidden"} lg:block`}>
        <div className="border border-border rounded-lg p-s3 lg:p-s4">
          {filterContent}
        </div>
      </div>
    </div>
  );
}

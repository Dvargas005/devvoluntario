"use client";

import { useState } from "react";
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  PLATFORM_LABELS,
  DEVROLE_LABELS,
  REGION_LABELS,
} from "@/lib/labels";

type InitiativeData = {
  id?: string;
  name?: string;
  tagline?: string | null;
  description?: string;
  status?: string;
  primaryCategory?: string;
  secondaryCats?: string[];
  platforms?: string[];
  techStack?: string[];
  coverage?: string[];
  repoVisibility?: string;
  repoUrl?: string | null;
  liveUrl?: string | null;
  needsHelp?: boolean;
  neededRoles?: string[];
};

export default function InitiativeForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  defaults?: InitiativeData;
  submitLabel: string;
}) {
  const [needsHelp, setNeedsHelp] = useState(defaults?.needsHelp ?? false);
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      action={async (formData) => {
        setSubmitting(true);
        try {
          await action(formData);
        } catch {
          setSubmitting(false);
        }
      }}
      className="space-y-s5"
    >
      {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}

      {/* Nombre */}
      <Field label="Nombre del proyecto *">
        <input
          name="name"
          required
          defaultValue={defaults?.name}
          placeholder="Ej: ReliefMap Venezuela"
          className="form-input"
        />
      </Field>

      {/* Tagline */}
      <Field label="Tagline">
        <input
          name="tagline"
          defaultValue={defaults?.tagline ?? ""}
          placeholder="Descripción breve en una línea"
          className="form-input"
        />
      </Field>

      {/* Descripción */}
      <Field label="Descripción *">
        <textarea
          name="description"
          required
          rows={5}
          defaultValue={defaults?.description}
          placeholder="¿Qué hace el proyecto? ¿A quién ayuda?"
          className="form-input resize-y"
        />
      </Field>

      {/* Estado + Categoría principal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-s3">
        <Field label="Estado *">
          <select
            name="status"
            required
            defaultValue={defaults?.status || "IN_DEVELOPMENT"}
            className="form-input"
          >
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Categoría principal *">
          <select
            name="primaryCategory"
            required
            defaultValue={defaults?.primaryCategory}
            className="form-input"
          >
            <option value="">Seleccionar...</option>
            {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Categorías secundarias */}
      <CheckboxGroup
        label="Categorías secundarias"
        name="secondaryCats"
        options={CATEGORY_LABELS}
        defaults={defaults?.secondaryCats}
      />

      {/* Plataformas */}
      <CheckboxGroup
        label="Plataformas"
        name="platforms"
        options={PLATFORM_LABELS}
        defaults={defaults?.platforms}
      />

      {/* Tech Stack */}
      <Field label="Tech Stack">
        <input
          name="techStack"
          defaultValue={defaults?.techStack?.join(", ") ?? ""}
          placeholder="React, Node.js, PostgreSQL (separado por comas)"
          className="form-input"
        />
      </Field>

      {/* Cobertura */}
      <CheckboxGroup
        label="Cobertura geográfica"
        name="coverage"
        options={REGION_LABELS}
        defaults={defaults?.coverage}
      />

      {/* Repositorio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-s3">
        <Field label="Visibilidad del repo">
          <select
            name="repoVisibility"
            defaultValue={defaults?.repoVisibility || "NONE"}
            className="form-input"
          >
            <option value="NONE">Sin repositorio</option>
            <option value="PUBLIC">Público</option>
            <option value="PRIVATE">Privado</option>
          </select>
        </Field>

        <Field label="URL del repositorio">
          <input
            name="repoUrl"
            type="url"
            defaultValue={defaults?.repoUrl ?? ""}
            placeholder="https://github.com/..."
            className="form-input"
          />
        </Field>
      </div>

      {/* URL en vivo */}
      <Field label="URL del sitio / app">
        <input
          name="liveUrl"
          type="url"
          defaultValue={defaults?.liveUrl ?? ""}
          placeholder="https://..."
          className="form-input"
        />
      </Field>

      {/* Necesita apoyo */}
      <div className="space-y-s2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="hidden"
            name="needsHelp"
            value={needsHelp ? "true" : "false"}
          />
          <button
            type="button"
            role="switch"
            aria-checked={needsHelp}
            onClick={() => setNeedsHelp(!needsHelp)}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              needsHelp ? "bg-fresh-mint/40" : "bg-border"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${
                needsHelp ? "translate-x-5" : ""
              }`}
            />
          </button>
          <span className="text-sm">¿Necesita voluntarios?</span>
        </label>

        {needsHelp && (
          <CheckboxGroup
            label="Roles que buscan"
            name="neededRoles"
            options={DEVROLE_LABELS}
            defaults={defaults?.neededRoles}
          />
        )}
      </div>

      {/* No-payment rule */}
      <p className="text-xs text-muted/40 leading-relaxed">
        Dev Voluntario es un directorio sin fines de lucro. No solicites ni
        aceptes pagos a través de esta plataforma.
      </p>

      {/* Submit */}
      <div className="pt-s2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-s4 py-s1 bg-foreground text-bg font-medium rounded-lg hover:bg-muted disabled:opacity-50 transition-colors"
        >
          {submitting ? "Guardando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

// ─── Helpers ───

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm text-muted/80 mb-1">{label}</label>
      {children}
    </div>
  );
}

function CheckboxGroup({
  label,
  name,
  options,
  defaults,
}: {
  label: string;
  name: string;
  options: Record<string, string>;
  defaults?: string[];
}) {
  const defaultSet = new Set(defaults ?? []);
  return (
    <div>
      <p className="text-sm text-muted/80 mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {Object.entries(options).map(([val, display]) => (
          <label
            key={val}
            className="flex items-center gap-1.5 text-sm cursor-pointer min-w-0"
          >
            <input
              type="checkbox"
              name={name}
              value={val}
              defaultChecked={defaultSet.has(val)}
              className="w-4 h-4 shrink-0 rounded border-border bg-surface accent-fresh-mint"
            />
            <span className="text-muted/80">{display}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

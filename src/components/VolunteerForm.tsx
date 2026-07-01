"use client";

import { useState } from "react";
import { DEVROLE_LABELS } from "@/lib/labels";

type VolunteerData = {
  roles: string[];
  skills: string[];
  availability: string | null;
  contactPref: string | null;
} | null;

export default function VolunteerForm({
  action,
  defaults,
}: {
  action: (formData: FormData) => Promise<void>;
  defaults: VolunteerData;
}) {
  const [submitting, setSubmitting] = useState(false);
  const defaultRoles = new Set(defaults?.roles ?? []);

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
      className="space-y-s3"
    >
      {/* Anti-doxeo notice */}
      <div className="border border-forest-green/30 rounded-lg px-s3 py-s2 text-sm text-muted leading-relaxed">
        Se te asigna un identificador anónimo. No pedimos tu nombre.
        No coordinamos más allá de conectar la necesidad de una app con
        los voluntarios disponibles del rol requerido.
      </div>

      {/* Roles */}
      <div>
        <p className="text-sm text-muted/80 mb-1.5">
          Roles que puedes cubrir *
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {Object.entries(DEVROLE_LABELS).map(([val, display]) => (
            <label
              key={val}
              className="flex items-center gap-1.5 text-sm cursor-pointer min-w-0"
            >
              <input
                type="checkbox"
                name="roles"
                value={val}
                defaultChecked={defaultRoles.has(val)}
                className="w-4 h-4 shrink-0 rounded border-border bg-surface accent-fresh-mint"
              />
              <span className="text-muted/80">{display}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <label className="block text-sm text-muted/80 mb-1">
          Habilidades / tecnologías
        </label>
        <input
          name="skills"
          defaultValue={defaults?.skills?.join(", ") ?? ""}
          placeholder="React, Python, Figma (separado por comas)"
          className="form-input"
        />
      </div>

      {/* Availability */}
      <div>
        <label className="block text-sm text-muted/80 mb-1">
          Disponibilidad
        </label>
        <input
          name="availability"
          defaultValue={defaults?.availability ?? ""}
          placeholder="Ej: Fines de semana, 5h/semana"
          className="form-input"
        />
      </div>

      {/* Contact preference (private) */}
      <div>
        <label className="block text-sm text-muted/80 mb-1">
          Preferencia de contacto
        </label>
        <input
          name="contactPref"
          defaultValue={defaults?.contactPref ?? ""}
          placeholder="Ej: Telegram @user, Discord, etc."
          className="form-input"
        />
        <p className="text-xs text-muted/40 mt-1">
          Dato privado — no se muestra públicamente.
        </p>
      </div>

      <div className="pt-s1">
        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-s4 py-s1 bg-foreground text-bg font-medium rounded-lg hover:bg-muted disabled:opacity-50 transition-colors"
        >
          {submitting
            ? "Guardando..."
            : defaults
              ? "Actualizar perfil"
              : "Registrarme como voluntario"}
        </button>
      </div>
    </form>
  );
}

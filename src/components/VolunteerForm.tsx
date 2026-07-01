"use client";

import { useState } from "react";
import { DEVROLE_LABELS } from "@/lib/labels";

type VolunteerData = {
  displayName: string;
  roles: string[];
  skills: string[];
  availability: string | null;
  contactPref: string | null;
  listedPublicly: boolean;
} | null;

export default function VolunteerForm({
  action,
  defaults,
}: {
  action: (formData: FormData) => Promise<void>;
  defaults: VolunteerData;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [listedPublicly, setListedPublicly] = useState(
    defaults?.listedPublicly ?? true
  );

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
      className="space-y-s3 max-w-lg"
    >
      {/* Display name */}
      <div>
        <label className="block text-sm text-muted/80 mb-1">
          Nombre público *
        </label>
        <input
          name="displayName"
          required
          defaultValue={defaults?.displayName ?? ""}
          placeholder="Tu seudónimo o nombre"
          className="form-input"
        />
      </div>

      {/* Roles */}
      <div>
        <p className="text-sm text-muted/80 mb-1.5">Roles que puedes cubrir *</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(DEVROLE_LABELS).map(([val, display]) => (
            <label
              key={val}
              className="flex items-center gap-1.5 text-xs cursor-pointer"
            >
              <input
                type="checkbox"
                name="roles"
                value={val}
                defaultChecked={defaultRoles.has(val)}
                className="w-3.5 h-3.5 rounded border-border bg-surface accent-fresh-mint"
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

      {/* Contact preference */}
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
      </div>

      {/* Public listing */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="hidden"
          name="listedPublicly"
          value={listedPublicly ? "true" : "false"}
        />
        <button
          type="button"
          role="switch"
          aria-checked={listedPublicly}
          onClick={() => setListedPublicly(!listedPublicly)}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            listedPublicly ? "bg-fresh-mint/40" : "bg-border"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${
              listedPublicly ? "translate-x-5" : ""
            }`}
          />
        </button>
        <span className="text-sm">Aparecer en el listado público</span>
      </label>

      <div className="pt-s1">
        <button
          type="submit"
          disabled={submitting}
          className="px-s4 py-s1 bg-foreground text-bg font-medium rounded-lg hover:bg-muted disabled:opacity-50 transition-colors"
        >
          {submitting
            ? "Guardando..."
            : defaults
              ? "Actualizar perfil"
              : "Registrarme"}
        </button>
      </div>
    </form>
  );
}

"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-server";
import { sendEmail } from "@/lib/email";
import { DEVROLE_LABELS } from "@/lib/labels";
import type { DevRole } from "@/generated/prisma/client";

export async function requestMatch(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("No autenticado");

  const initiativeId = formData.get("initiativeId") as string;
  const volunteerId = formData.get("volunteerId") as string;
  const role = formData.get("role") as DevRole;

  if (!initiativeId || !volunteerId || !role) {
    throw new Error("Datos incompletos");
  }

  // Verify initiative is claimed by the current user
  const initiative = await prisma.initiative.findUnique({
    where: { id: initiativeId },
    select: { ownerUserId: true, name: true, needsHelp: true, neededRoles: true },
  });
  if (!initiative) throw new Error("Iniciativa no encontrada");
  if (initiative.ownerUserId !== session.user.id) {
    throw new Error("Solo el responsable del proyecto puede solicitar conexión");
  }
  if (!initiative.needsHelp) {
    throw new Error("Esta iniciativa no solicita apoyo");
  }

  // Verify volunteer exists, has consented, and has the requested role
  const volunteer = await prisma.volunteer.findUnique({
    where: { id: volunteerId },
    select: {
      id: true,
      roles: true,
      consentToShare: true,
      user: { select: { email: true } },
      displayName: true,
    },
  });
  if (!volunteer) throw new Error("Voluntario no encontrado");
  if (!volunteer.consentToShare) {
    throw new Error("El voluntario no ha dado consentimiento para compartir contacto");
  }
  if (!volunteer.roles.includes(role)) {
    throw new Error("El voluntario no tiene ese rol");
  }

  // Check if match already exists
  const existing = await prisma.match.findUnique({
    where: {
      initiativeId_volunteerId_role: { initiativeId, volunteerId, role },
    },
  });
  if (existing) {
    throw new Error("Ya existe una solicitud para este voluntario y rol");
  }

  // Create the match
  const match = await prisma.match.create({
    data: { initiativeId, volunteerId, role },
  });

  // Send email to volunteer
  const appUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  const acceptUrl = `${appUrl}/api/match/respond?token=${match.token}&action=accept`;
  const declineUrl = `${appUrl}/api/match/respond?token=${match.token}&action=decline`;
  const roleLabel = DEVROLE_LABELS[role] ?? role;

  await sendEmail({
    to: volunteer.user.email,
    subject: "Un proyecto necesita tu perfil — Dev Voluntario",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #e8e8e8;">Solicitud de conexión</h2>
        <p>El proyecto <strong>${initiative.name}</strong> del directorio Dev Voluntario
        busca apoyo para el rol de <strong>${roleLabel}</strong> y tu perfil coincide.</p>
        <p>Si aceptas, compartiremos <strong>únicamente</strong> el medio de contacto que
        registraste con el responsable del proyecto. Nada más.</p>
        <div style="margin: 24px 0;">
          <a href="${acceptUrl}"
             style="display: inline-block; padding: 10px 24px; background: #2d6a4f; color: #fff; text-decoration: none; border-radius: 6px; margin-right: 12px;">
            Aceptar y conectar
          </a>
          <a href="${declineUrl}"
             style="display: inline-block; padding: 10px 24px; background: #333; color: #ccc; text-decoration: none; border-radius: 6px;">
            Rechazar
          </a>
        </div>
        <p style="font-size: 12px; color: #888;">
          Si no reconoces esta solicitud, puedes ignorar este correo.
        </p>
      </div>
    `,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { DEVROLE_LABELS } from "@/lib/labels";

function htmlPage(title: string, message: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — Dev Voluntario</title>
<style>
  body { font-family: sans-serif; background: #0a0a0a; color: #e8e8e8; display: flex;
         justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
  .card { max-width: 420px; padding: 2rem; text-align: center; }
  h1 { font-size: 1.5rem; margin-bottom: 1rem; }
  p { color: #999; line-height: 1.6; }
  a { color: #52b788; }
</style></head>
<body><div class="card"><h1>${title}</h1><p>${message}</p>
<p style="margin-top:2rem"><a href="/">Volver al directorio</a></p>
</div></body></html>`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token = searchParams.get("token");
  const action = searchParams.get("action");

  if (!token || !["accept", "decline"].includes(action ?? "")) {
    return new NextResponse(
      htmlPage("Enlace inválido", "El enlace no es válido o ha expirado."),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const match = await prisma.match.findUnique({
    where: { token },
    include: {
      volunteer: {
        select: { displayName: true, contactPref: true, roles: true, skills: true },
      },
      initiative: {
        select: {
          name: true,
          ownerUserId: true,
          owner: { select: { email: true } },
        },
      },
    },
  });

  if (!match) {
    return new NextResponse(
      htmlPage("Enlace inválido", "El enlace no es válido o ha expirado."),
      { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  if (match.status !== "PENDING") {
    const statusMsg =
      match.status === "ACCEPTED"
        ? "Ya aceptaste esta solicitud."
        : "Ya rechazaste esta solicitud.";
    return new NextResponse(
      htmlPage("Ya respondido", statusMsg),
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  if (action === "accept") {
    await prisma.match.update({
      where: { id: match.id },
      data: { status: "ACCEPTED", respondedAt: new Date() },
    });

    // Send email to initiative owner with volunteer contact info
    if (match.initiative.owner?.email) {
      const roleLabel = DEVROLE_LABELS[match.role] ?? match.role;
      const contactInfo = match.volunteer.contactPref
        ? `<p><strong>Medio de contacto:</strong> ${match.volunteer.contactPref}</p>`
        : `<p><em>El voluntario aceptó conectarse pero no registró un medio de contacto.</em></p>`;

      const skillsInfo =
        match.volunteer.skills.length > 0
          ? `<p><strong>Skills:</strong> ${match.volunteer.skills.join(", ")}</p>`
          : "";

      await sendEmail({
        to: match.initiative.owner.email,
        subject: `Un voluntario aceptó conectarse — ${match.initiative.name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #e8e8e8;">Conexión aceptada</h2>
            <p>Un voluntario aceptó conectarse con tu proyecto
            <strong>${match.initiative.name}</strong>.</p>
            <p><strong>Seudónimo:</strong> ${match.volunteer.displayName}</p>
            <p><strong>Rol:</strong> ${roleLabel}</p>
            ${skillsInfo}
            ${contactInfo}
            <p style="font-size: 12px; color: #888; margin-top: 24px;">
              Este es el único dato compartido. No compartas esta información
              fuera del contexto del proyecto.
            </p>
          </div>
        `,
      });
    }

    return new NextResponse(
      htmlPage(
        "Conexión aceptada",
        "Compartimos tu medio de contacto con el responsable del proyecto. Gracias por tu apoyo."
      ),
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  // action === "decline"
  await prisma.match.update({
    where: { id: match.id },
    data: { status: "DECLINED", respondedAt: new Date() },
  });

  return new NextResponse(
    htmlPage(
      "Solicitud rechazada",
      "No se compartió ningún dato. Puedes seguir como voluntario disponible para otras solicitudes."
    ),
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

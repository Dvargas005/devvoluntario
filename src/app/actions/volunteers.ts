"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-server";
import { generatePseudonym } from "@/lib/pseudonym";
import type { DevRole } from "@/generated/prisma/client";

export async function upsertVolunteer(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const roles = formData.getAll("roles") as DevRole[];
  const skillsRaw = (formData.get("skills") as string)?.trim();
  const skills = skillsRaw
    ? skillsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const availability = (formData.get("availability") as string)?.trim() || null;
  const contactPref = (formData.get("contactPref") as string)?.trim() || null;

  if (roles.length === 0) {
    throw new Error("Selecciona al menos un rol");
  }

  // Auto-assign anonymous pseudonym (deterministic from volunteerId seed)
  const existing = await prisma.volunteer.findUnique({
    where: { userId: session.user.id },
    select: { displayName: true },
  });
  const displayName = existing?.displayName || generatePseudonym(session.user.id + "-vol");

  await prisma.volunteer.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      displayName,
      roles,
      skills,
      availability,
      contactPref,
      listedPublicly: false,
    },
    update: {
      roles,
      skills,
      availability,
      contactPref,
    },
  });

  redirect("/voluntarios?registrado=1");
}

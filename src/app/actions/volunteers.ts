"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-server";
import type { DevRole } from "@/generated/prisma/client";

export async function upsertVolunteer(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const displayName = (formData.get("displayName") as string)?.trim();
  const roles = formData.getAll("roles") as DevRole[];
  const skillsRaw = (formData.get("skills") as string)?.trim();
  const skills = skillsRaw
    ? skillsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const availability = (formData.get("availability") as string)?.trim() || null;
  const contactPref = (formData.get("contactPref") as string)?.trim() || null;
  const listedPublicly = formData.get("listedPublicly") !== "false";

  if (!displayName || roles.length === 0) {
    throw new Error("Nombre y al menos un rol son obligatorios");
  }

  await prisma.volunteer.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      displayName,
      roles,
      skills,
      availability,
      contactPref,
      listedPublicly,
    },
    update: {
      displayName,
      roles,
      skills,
      availability,
      contactPref,
      listedPublicly,
    },
  });

  redirect("/voluntarios");
}

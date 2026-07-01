"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-server";
import type {
  Category,
  Platform,
  DevRole,
  Region,
  InitiativeStatus,
  RepoVisibility,
} from "@/generated/prisma/client";

// ─── Create ───

export async function createInitiative(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const name = (formData.get("name") as string)?.trim();
  const tagline = (formData.get("tagline") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim();
  const status = formData.get("status") as InitiativeStatus;
  const primaryCategory = formData.get("primaryCategory") as Category;
  const secondaryCats = formData.getAll("secondaryCats") as Category[];
  const platforms = formData.getAll("platforms") as Platform[];
  const techStackRaw = (formData.get("techStack") as string)?.trim();
  const techStack = techStackRaw
    ? techStackRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const coverage = formData.getAll("coverage") as Region[];
  const repoVisibility = (formData.get("repoVisibility") as RepoVisibility) || "NONE";
  const repoUrl = (formData.get("repoUrl") as string)?.trim() || null;
  const liveUrl = (formData.get("liveUrl") as string)?.trim() || null;
  const needsHelp = formData.get("needsHelp") === "true";
  const neededRoles = needsHelp
    ? (formData.getAll("neededRoles") as DevRole[])
    : [];

  if (!name || !description || !primaryCategory) {
    throw new Error("Faltan campos obligatorios");
  }

  const initiative = await prisma.initiative.create({
    data: {
      name,
      tagline,
      description,
      status,
      primaryCategory,
      secondaryCats,
      platforms,
      techStack,
      coverage,
      repoVisibility,
      repoUrl,
      liveUrl,
      needsHelp,
      neededRoles,
      createdById: session.user.id,
      ownerUserId: session.user.id,
      audit: {
        create: {
          userId: session.user.id,
          action: "CREATE",
          changedFields: {},
        },
      },
    },
  });

  redirect(`/iniciativas/${initiative.id}`);
}

// ─── Update (wiki model: anyone logged in can edit) ───

export async function updateInitiative(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const id = formData.get("id") as string;
  if (!id) throw new Error("ID de iniciativa faltante");

  const current = await prisma.initiative.findUnique({ where: { id } });
  if (!current) throw new Error("Iniciativa no encontrada");

  const name = (formData.get("name") as string)?.trim();
  const tagline = (formData.get("tagline") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim();
  const status = formData.get("status") as InitiativeStatus;
  const primaryCategory = formData.get("primaryCategory") as Category;
  const secondaryCats = formData.getAll("secondaryCats") as Category[];
  const platforms = formData.getAll("platforms") as Platform[];
  const techStackRaw = (formData.get("techStack") as string)?.trim();
  const techStack = techStackRaw
    ? techStackRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const coverage = formData.getAll("coverage") as Region[];
  const repoVisibility = (formData.get("repoVisibility") as RepoVisibility) || "NONE";
  const repoUrl = (formData.get("repoUrl") as string)?.trim() || null;
  const liveUrl = (formData.get("liveUrl") as string)?.trim() || null;
  const needsHelp = formData.get("needsHelp") === "true";
  const neededRoles = needsHelp
    ? (formData.getAll("neededRoles") as DevRole[])
    : [];

  if (!name || !description || !primaryCategory) {
    throw new Error("Faltan campos obligatorios");
  }

  // ─── Compute diff ───
  type JsonVal = string | number | boolean | null | JsonVal[] | { [key: string]: JsonVal };
  const diff: Record<string, { from: JsonVal; to: JsonVal }> = {};

  if (current.name !== name) diff.name = { from: current.name, to: name };
  if (current.tagline !== tagline) diff.tagline = { from: current.tagline, to: tagline };

  // Strip unverified prefix for comparison
  const UNVERIFIED_PREFIX = "[Datos por confirmar]";
  const cleanCurrentDesc = current.description.startsWith(UNVERIFIED_PREFIX)
    ? current.description.slice(UNVERIFIED_PREFIX.length).trim()
    : current.description;
  if (cleanCurrentDesc !== description) diff.description = { from: cleanCurrentDesc, to: description };

  if (current.status !== status) diff.status = { from: current.status, to: status };
  if (current.primaryCategory !== primaryCategory) diff.primaryCategory = { from: current.primaryCategory, to: primaryCategory };
  if (JSON.stringify(current.secondaryCats) !== JSON.stringify(secondaryCats)) diff.secondaryCats = { from: current.secondaryCats, to: secondaryCats };
  if (JSON.stringify(current.platforms) !== JSON.stringify(platforms)) diff.platforms = { from: current.platforms, to: platforms };
  if (JSON.stringify(current.techStack) !== JSON.stringify(techStack)) diff.techStack = { from: current.techStack, to: techStack };
  if (JSON.stringify(current.coverage) !== JSON.stringify(coverage)) diff.coverage = { from: current.coverage, to: coverage };
  if (current.repoVisibility !== repoVisibility) diff.repoVisibility = { from: current.repoVisibility, to: repoVisibility };
  if (current.repoUrl !== repoUrl) diff.repoUrl = { from: current.repoUrl, to: repoUrl };
  if (current.liveUrl !== liveUrl) diff.liveUrl = { from: current.liveUrl, to: liveUrl };
  if (current.needsHelp !== needsHelp) diff.needsHelp = { from: current.needsHelp, to: needsHelp };
  if (JSON.stringify(current.neededRoles) !== JSON.stringify(neededRoles)) diff.neededRoles = { from: current.neededRoles, to: neededRoles };

  // No changes? Just redirect back
  if (Object.keys(diff).length === 0) {
    redirect(`/iniciativas/${id}`);
  }

  // Remove unverified prefix on edit (user-confirmed data)
  const finalDescription = current.description.startsWith(UNVERIFIED_PREFIX)
    ? description
    : description;

  await prisma.$transaction([
    prisma.initiative.update({
      where: { id },
      data: {
        name,
        tagline,
        description: finalDescription,
        status,
        primaryCategory,
        secondaryCats,
        platforms,
        techStack,
        coverage,
        repoVisibility,
        repoUrl,
        liveUrl,
        needsHelp,
        neededRoles,
      },
    }),
    prisma.auditEntry.create({
      data: {
        initiativeId: id,
        userId: session.user.id,
        action: "UPDATE",
        changedFields: diff,
      },
    }),
  ]);

  redirect(`/iniciativas/${id}`);
}

// ─── Claim ownership ───

export async function claimInitiative(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const id = formData.get("id") as string;
  if (!id) throw new Error("ID de iniciativa faltante");

  const current = await prisma.initiative.findUnique({ where: { id } });
  if (!current) throw new Error("Iniciativa no encontrada");

  // Already has an owner
  if (current.ownerUserId) {
    throw new Error("Esta iniciativa ya tiene un responsable");
  }

  await prisma.$transaction([
    prisma.initiative.update({
      where: { id },
      data: { ownerUserId: session.user.id },
    }),
    prisma.auditEntry.create({
      data: {
        initiativeId: id,
        userId: session.user.id,
        action: "CLAIM",
        changedFields: { ownerUserId: { from: null, to: session.user.id } },
      },
    }),
  ]);

  redirect(`/iniciativas/${id}`);
}

/**
 * Seed script — idempotente (usa upsert, se puede correr varias veces).
 *
 * Uso:
 *   npx tsx prisma/seed.ts
 *   — o —
 *   npm run db:seed
 *
 * Requiere .env.local con DATABASE_URL apuntando a Neon.
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

// ─── Seed user ───
const SEED_USER = {
  email: "dvargas.taita@gmail.com",
  displayName: "Yellow Tiger",
  name: "Yellow Tiger",
  isPublic: false,
  emailVerified: true,
};

// ─── Initiatives ───
// Cada una marcada con "[Datos por confirmar]" al inicio de la descripción
// para indicar que la clasificación es inferida y debe ser verificada.
const UNVERIFIED_PREFIX = "[Datos por confirmar] ";

interface InitiativeSeed {
  name: string;
  liveUrl: string;
  description: string;
  primaryCategory: string;
  status?: string;
  repoVisibility?: string;
  repoUrl?: string;
  platforms?: string[];
}

const INITIATIVES: InitiativeSeed[] = [
  {
    name: "TuIA911 / Together",
    liveUrl: "https://tuia911.com/",
    description:
      UNVERIFIED_PREFIX +
      "Plataforma de búsqueda de personas desaparecidas tras el terremoto.",
    primaryCategory: "MISSING_PERSONS",
    repoVisibility: "PUBLIC",
    repoUrl: "https://gitlab.com/terremoto-2026/together",
  },
  {
    name: "Alma AJE",
    liveUrl: "https://t.me/redajeapoyobot",
    description:
      UNVERIFIED_PREFIX +
      "Bot de Telegram para información y apoyo tras el terremoto.",
    primaryCategory: "INFO_COMMS",
    platforms: ["BOT"],
  },
  {
    name: "RedQuipu",
    liveUrl: "https://redquipu.com/",
    description:
      UNVERIFIED_PREFIX +
      "Plataforma de información y comunicación para la respuesta al terremoto.",
    primaryCategory: "INFO_COMMS",
  },
  {
    name: "Avisa VE",
    liveUrl: "https://avisave.com/",
    description:
      UNVERIFIED_PREFIX +
      "Sistema de información y comunicación para emergencias en Venezuela.",
    primaryCategory: "INFO_COMMS",
  },
  {
    name: "Venezuela Sismo 2026 / OpenS",
    liveUrl: "https://acoplo-vnzla.vercel.app/",
    description:
      UNVERIFIED_PREFIX +
      "Plataforma de datos abiertos e infraestructura para la respuesta al sismo.",
    primaryCategory: "OPEN_DATA_INFRA",
  },
  {
    name: "Ayuda Venezuela — Mapa de necesidades",
    liveUrl: "https://mapadenecesidadesvzla.com/",
    description:
      UNVERIFIED_PREFIX +
      "Mapa interactivo de necesidades y daños reportados tras el terremoto.",
    primaryCategory: "DAMAGE_MAPPING",
  },
  {
    name: "Centro de ayuda",
    liveUrl: "https://red-help-ve.vercel.app/",
    description:
      UNVERIFIED_PREFIX +
      "Centro de donaciones y logística para apoyar a los afectados.",
    primaryCategory: "DONATIONS_LOGISTICS",
  },
  {
    name: "Aquí Estoy App",
    liveUrl: "https://aquiestoyapp.com/",
    description:
      UNVERIFIED_PREFIX +
      "Aplicación para reportar y buscar personas desaparecidas.",
    primaryCategory: "MISSING_PERSONS",
  },
  {
    name: "VZLA Ayuda",
    liveUrl: "https://vzlayuda.com/",
    description:
      UNVERIFIED_PREFIX +
      "Plataforma de donaciones y logística para Venezuela.",
    primaryCategory: "DONATIONS_LOGISTICS",
  },
  {
    name: "Refugios Venezuela",
    liveUrl: "https://refugiosvenezuela.com/",
    description:
      UNVERIFIED_PREFIX +
      "Directorio de refugios y albergues disponibles. API pública: https://refugiosvenezuela.com/api",
    primaryCategory: "SHELTERS",
    platforms: ["WEB", "API"],
  },
  {
    name: "Apoyo Venezuela",
    liveUrl: "https://apoyovenezuela.com/",
    description:
      UNVERIFIED_PREFIX +
      "Plataforma de donaciones e insumos. Documentación API: https://apoyovenezuela.com/api-docs",
    primaryCategory: "DONATIONS_LOGISTICS",
    platforms: ["WEB", "API"],
  },
  {
    name: "Centro Nacional de Localización de Personas",
    liveUrl: "http://localizapacientes.com/",
    description:
      UNVERIFIED_PREFIX +
      "Sistema nacional para la localización de personas desaparecidas.",
    primaryCategory: "MISSING_PERSONS",
  },
  {
    name: "Hospitales en Venezuela",
    liveUrl: "https://hospitalesenvenezuela.com/",
    description:
      UNVERIFIED_PREFIX +
      "Directorio de hospitales y servicios de salud disponibles tras el terremoto.",
    primaryCategory: "HEALTH_TELEMEDICINE",
  },
];

async function main() {
  console.log("Seeding database...\n");

  // 1) Upsert seed user
  const user = await prisma.user.upsert({
    where: { email: SEED_USER.email },
    update: {
      displayName: SEED_USER.displayName,
      isPublic: SEED_USER.isPublic,
    },
    create: {
      ...SEED_USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  console.log(`✓ User: ${user.displayName} (${user.email})`);

  // 2) Upsert initiatives (idempotent by name)
  for (const ini of INITIATIVES) {
    const result = await prisma.initiative.upsert({
      where: {
        // Use name + createdById as unique identifier via a findFirst fallback
        id:
          (
            await prisma.initiative.findFirst({
              where: { name: ini.name, createdById: user.id },
              select: { id: true },
            })
          )?.id ?? "nonexistent-id-for-create",
      },
      update: {
        description: ini.description,
        liveUrl: ini.liveUrl,
        primaryCategory: ini.primaryCategory as never,
        status: (ini.status ?? "IN_PRODUCTION") as never,
        repoVisibility: (ini.repoVisibility ?? "NONE") as never,
        repoUrl: ini.repoUrl ?? null,
        platforms: (ini.platforms ?? ["WEB"]) as never,
      },
      create: {
        name: ini.name,
        description: ini.description,
        liveUrl: ini.liveUrl,
        primaryCategory: ini.primaryCategory as never,
        status: (ini.status ?? "IN_PRODUCTION") as never,
        repoVisibility: (ini.repoVisibility ?? "NONE") as never,
        repoUrl: ini.repoUrl ?? null,
        platforms: (ini.platforms ?? ["WEB"]) as never,
        techStack: [],
        secondaryCats: [],
        coverage: [],
        neededRoles: [],
        needsHelp: false,
        createdById: user.id,
      },
    });
    console.log(`✓ Initiative: ${result.name}`);
  }

  console.log(`\nDone! Seeded ${INITIATIVES.length} initiatives.`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

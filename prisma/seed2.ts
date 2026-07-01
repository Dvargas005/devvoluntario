/**
 * Seed 2 — Enriquecer existentes + agregar nuevas iniciativas.
 * Idempotente por liveUrl (usa findFirst + upsert).
 *
 * Uso:
 *   npx tsx prisma/seed2.ts
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const UNVERIFIED_PREFIX = "[Datos por confirmar] ";
const CHILD_PROTECTION_DISCLAIMER =
  "[Protección de menores] Iniciativa de resguardo infantil. Este directorio no publica mecanismos de contacto con menores. Para lo relacionado con niñez, la referencia es CECODAP.";

interface InitiativeSeed {
  name: string;
  liveUrl: string;
  description: string;
  primaryCategory: string;
  status?: string;
  repoVisibility?: string;
  repoUrl?: string;
  platforms?: string[];
  needsHelp?: boolean;
  neededRoles?: string[];
}

// ─── Enriquecer existentes ───

const ENRICH: InitiativeSeed[] = [
  {
    name: "Avisa VE",
    liveUrl: "https://avisave.com/",
    description:
      UNVERIFIED_PREFIX +
      "Búsqueda de personas desaparecidas con OCR + IA (Gemini). Verifica reportes triangulando dos APIs externas y filtra automáticamente datos de menores. " +
      "API pública de lectura: api.avisave.com/api/public/incidents (docs en openapi.json). " +
      "Conectada con Venezuela Te Busca para alertas de incidentes críticos.",
    primaryCategory: "MISSING_PERSONS",
    platforms: ["WEB", "API"],
  },
  {
    name: "TuIA911 / Together",
    liveUrl: "https://tuia911.com/",
    description:
      UNVERIFIED_PREFIX +
      "API central de búsqueda de personas (docs: tuia911.com/api.html). Backend Supabase. " +
      "Comparte datos con Mapa de Necesidades VZLA. Usada como fuente por Bot Búsqueda VZLA, Encuéntrame VE y Aquí Estoy App.",
    primaryCategory: "MISSING_PERSONS",
    platforms: ["WEB", "API"],
    repoVisibility: "PUBLIC",
    repoUrl: "https://gitlab.com/terremoto-2026/together",
  },
  {
    name: "Centro Nacional de Localización de Personas",
    liveUrl: "http://localizapacientes.com/",
    description:
      UNVERIFIED_PREFIX +
      "Página oficial del Estado para localización de personas. Los hospitales suben la data directamente. " +
      "Usada como fuente por Encuéntrame VE y Bot Búsqueda VZLA.",
    primaryCategory: "MISSING_PERSONS",
  },
  {
    name: "Aquí Estoy App",
    liveUrl: "https://aquiestoyapp.com/",
    description:
      UNVERIFIED_PREFIX +
      "Búsqueda de personas por reconocimiento facial. Gratuita. " +
      "Conecta con TuIA911 para ampliar la base de datos de búsqueda.",
    primaryCategory: "MISSING_PERSONS",
  },
  {
    name: "Hospitales en Venezuela",
    liveUrl: "https://hospitalesenvenezuela.com/",
    description:
      UNVERIFIED_PREFIX +
      "Listados hospitalarios con información de servicios disponibles. " +
      "Canal de WhatsApp asociado para consultas.",
    primaryCategory: "HEALTH_TELEMEDICINE",
  },
  {
    name: "Ayuda Venezuela — Mapa de necesidades",
    liveUrl: "https://mapadenecesidadesvzla.com/",
    description:
      UNVERIFIED_PREFIX +
      "Mapa interactivo de necesidades y daños reportados tras el terremoto. API libre. " +
      "Comparte datos con TuIA911.",
    primaryCategory: "DAMAGE_MAPPING",
    platforms: ["WEB", "API"],
  },
];

// ─── Nuevas iniciativas ───

const NEW_INITIATIVES: InitiativeSeed[] = [
  // Búsqueda de personas
  {
    name: "Bot Búsqueda VZLA",
    liveUrl: "https://t.me/busqueda_vzla_temblor_bot",
    description:
      UNVERIFIED_PREFIX +
      "Bot de Telegram para búsqueda de personas por apellido o cédula en hospitales. " +
      "Usa las APIs de TuIA911 y AviSave como fuentes. +10.000 usuarios.",
    primaryCategory: "MISSING_PERSONS",
    platforms: ["BOT"],
  },
  {
    name: "Encuéntrame VE",
    liveUrl: "https://encuentrame-ve.com/",
    description:
      UNVERIFIED_PREFIX +
      "Bot de WhatsApp para búsqueda de personas. " +
      "Consulta múltiples fuentes: TuIA911, LocalizaPacientes y AviSave.",
    primaryCategory: "MISSING_PERSONS",
    platforms: ["BOT"],
  },
  {
    name: "EnlazaVenezuela",
    liveUrl: "https://enlazavenezuela.com/",
    description:
      UNVERIFIED_PREFIX +
      "Plataforma de búsqueda de personas desaparecidas con módulo adicional de búsqueda de psicólogos.",
    primaryCategory: "MISSING_PERSONS",
  },
  {
    name: "Venezuela Te Busca",
    liveUrl: "https://venezuelatebusca.com/",
    description:
      UNVERIFIED_PREFIX +
      "Plataforma con gran volumen de registros de personas. Monitorea y coordina alertas de incidentes críticos. " +
      "Conectada con AviSave para alertas.",
    primaryCategory: "MISSING_PERSONS",
  },
  {
    name: "Red Ayuda Venezuela",
    liveUrl: "https://redayudavenezuela.com/",
    description:
      UNVERIFIED_PREFIX +
      "Plataforma de búsqueda de personas desaparecidas tras el terremoto.",
    primaryCategory: "MISSING_PERSONS",
  },
  {
    name: "Desaparecidos Terremoto Venezuela",
    liveUrl: "https://desaparecidosterremotovenezuela.com/",
    description:
      UNVERIFIED_PREFIX +
      "Plataforma de registro y búsqueda de personas desaparecidas tras el terremoto.",
    primaryCategory: "MISSING_PERSONS",
  },
  {
    name: "ReportaVnzla",
    liveUrl: "https://reportavnzla.com/",
    description:
      UNVERIFIED_PREFIX +
      "Plataforma de reportes y búsqueda de personas desaparecidas.",
    primaryCategory: "MISSING_PERSONS",
  },
  {
    name: "Reencuentra VE",
    liveUrl: "https://reencuentra-ve.vercel.app/",
    description:
      UNVERIFIED_PREFIX +
      "Plataforma de búsqueda y reencuentro de personas desaparecidas.",
    primaryCategory: "MISSING_PERSONS",
  },
  {
    name: "SOS Venezuela 2026",
    liveUrl: "https://sosvenezuela2026.com/",
    description:
      UNVERIFIED_PREFIX +
      "Plataforma de búsqueda de personas desaparecidas tras el terremoto de 2026.",
    primaryCategory: "MISSING_PERSONS",
  },

  // Protección de menores
  {
    name: "ResguardoInfantil",
    liveUrl: "https://resguardoinfantil.com/",
    description:
      CHILD_PROTECTION_DISCLAIMER +
      " " +
      UNVERIFIED_PREFIX +
      "Iniciativa de protección infantil en conversación con CECODAP.",
    primaryCategory: "INFO_COMMS",
  },

  // Salud / apoyo psicológico
  {
    name: "Asistencia Médica FViveMás",
    liveUrl: "https://asistencia-medica-fvivemas.web.app/",
    description:
      UNVERIFIED_PREFIX +
      "Plataforma de asistencia médica y telemedicina.",
    primaryCategory: "HEALTH_TELEMEDICINE",
  },
  {
    name: "Praxis Grupos Operativos (PAP)",
    liveUrl: "https://wa.me/5215533200457",
    description:
      UNVERIFIED_PREFIX +
      "Primeros auxilios psicológicos (PAP) virtuales gratuitos. Red de ~250 psicólogos voluntarios. Contacto vía WhatsApp.",
    primaryCategory: "HEALTH_TELEMEDICINE",
    platforms: ["BOT"],
  },
  {
    name: "MundoYu",
    liveUrl: "https://plataforma-ayuda.mundoyu.com/",
    description:
      UNVERIFIED_PREFIX +
      "Registro de voluntarios profesionales para primeros auxilios psicológicos (PAP) gratuitos.",
    primaryCategory: "HEALTH_TELEMEDICINE",
  },

  // Refugios / logística
  {
    name: "Zana / ZanaPronto",
    liveUrl: "https://zanapronto.com/",
    description:
      UNVERIFIED_PREFIX +
      "Datos de refugios con WMS/OMS: albergues, comedores, portal de necesidades y capacidades, voluntarios, traducción a 15 idiomas, albergues de mascotas, clínicas gratuitas. Logística TMS/WMS/OMS.",
    primaryCategory: "SHELTERS",
  },
  {
    name: "Puertas Abiertas VZLA",
    liveUrl: "https://puertasabiertasvzla.org/",
    description:
      UNVERIFIED_PREFIX +
      "Datos de refugios y albergues. API disponible: puertasabiertasvzla.org/api/docs/.",
    primaryCategory: "SHELTERS",
    platforms: ["WEB", "API"],
  },
  {
    name: "Venezuela Se Levanta",
    liveUrl: "https://venezuelaselevanta.info/",
    description:
      UNVERIFIED_PREFIX +
      "Plataforma de donaciones y logística para apoyar a los afectados por el terremoto.",
    primaryCategory: "DONATIONS_LOGISTICS",
  },
  {
    name: "AyudaEnCamino",
    liveUrl: "https://ayudaencamino.com/",
    description:
      UNVERIFIED_PREFIX +
      "Plataforma de donaciones y logística para la respuesta al terremoto.",
    primaryCategory: "DONATIONS_LOGISTICS",
  },
  {
    name: "VenezuelaYuda",
    liveUrl: "https://venezuelayuda.com/",
    description:
      UNVERIFIED_PREFIX +
      "Plataforma de donaciones y logística para Venezuela.",
    primaryCategory: "DONATIONS_LOGISTICS",
  },

  // Coordinación / datos abiertos
  {
    name: "Red de coordinación en emergencias (offline-first)",
    liveUrl: "https://red-centros-acopio-477t.vercel.app/",
    description:
      UNVERIFIED_PREFIX +
      "Actualizar una web vía SMS abreviado sin conexión a internet (estoy a salvo / necesito ayuda). Diseñada para funcionar offline-first.",
    primaryCategory: "OPEN_DATA_INFRA",
    repoVisibility: "PUBLIC",
    repoUrl: "https://github.com/Dvargas005/red-centros-acopio",
  },
];

async function main() {
  console.log("Seed 2 — Enriquecer existentes + agregar nuevas\n");

  // 1) Find seed user
  const user = await prisma.user.findUnique({
    where: { email: "dvargas.taita@gmail.com" },
  });
  if (!user) {
    throw new Error(
      "Usuario dvargas.taita@gmail.com no encontrado. Corre primero seed.ts."
    );
  }
  console.log(`✓ Autor: ${user.displayName} (${user.email})\n`);

  // 2) Enrich existing initiatives (upsert by liveUrl)
  console.log("── Enriqueciendo existentes ──");
  for (const ini of ENRICH) {
    const existing = await prisma.initiative.findFirst({
      where: { liveUrl: ini.liveUrl },
      select: { id: true },
    });

    const result = await prisma.initiative.upsert({
      where: { id: existing?.id ?? "nonexistent-id-for-create" },
      update: {
        name: ini.name,
        description: ini.description,
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
        needsHelp: ini.needsHelp ?? false,
        createdById: user.id,
      },
    });
    console.log(`  ✓ ${existing ? "Actualizada" : "Creada"}: ${result.name}`);
  }

  // 3) Add new initiatives (upsert by liveUrl)
  console.log("\n── Nuevas iniciativas ──");
  for (const ini of NEW_INITIATIVES) {
    const existing = await prisma.initiative.findFirst({
      where: { liveUrl: ini.liveUrl },
      select: { id: true },
    });

    const result = await prisma.initiative.upsert({
      where: { id: existing?.id ?? "nonexistent-id-for-create" },
      update: {
        name: ini.name,
        description: ini.description,
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
        needsHelp: ini.needsHelp ?? false,
        createdById: user.id,
      },
    });
    console.log(`  ✓ ${existing ? "Actualizada" : "Creada"}: ${result.name}`);
  }

  const total = ENRICH.length + NEW_INITIATIVES.length;
  console.log(`\nDone! Procesadas ${total} iniciativas.`);
}

main()
  .catch((e) => {
    console.error("Seed 2 failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

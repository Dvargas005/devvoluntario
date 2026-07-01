/**
 * Human-readable labels for Prisma enums.
 * Shared across home page, detail page, filters, and future forms.
 */

export const CATEGORY_LABELS: Record<string, string> = {
  RESCUE_SEARCH: "Rescate y búsqueda",
  MISSING_PERSONS: "Personas desaparecidas",
  SHELTERS: "Refugios y albergues",
  DONATIONS_LOGISTICS: "Donaciones e insumos",
  HEALTH_TELEMEDICINE: "Salud y telemedicina",
  DAMAGE_MAPPING: "Mapeo de daños",
  INFO_COMMS: "Comunicación e info",
  VOLUNTEERING: "Voluntariado",
  FAMILY_REUNIFICATION: "Reunificación familiar",
  OPEN_DATA_INFRA: "Datos abiertos / infra",
};

export const STATUS_LABELS: Record<string, string> = {
  IDEA: "Idea",
  IN_DEVELOPMENT: "En desarrollo",
  IN_PRODUCTION: "En producción",
  PAUSED: "Pausado",
};

export const PLATFORM_LABELS: Record<string, string> = {
  WEB: "Web",
  MOBILE: "Móvil",
  BOT: "Bot",
  API: "API",
  OTHER: "Otro",
};

export const DEVROLE_LABELS: Record<string, string> = {
  DESIGN_UX: "Diseño / UX",
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  QA: "QA",
  PM_PO: "PM / PO",
  DATA: "Data",
  INFRA_DEVOPS: "Infra / DevOps",
  CONTENT_LEGAL: "Contenido / Legal",
};

export const REGION_LABELS: Record<string, string> = {
  YARACUY: "Yaracuy",
  CARABOBO: "Carabobo",
  LA_GUAIRA: "La Guaira",
  DISTRITO_CAPITAL: "Distrito Capital",
  ARAGUA: "Aragua",
  COJEDES: "Cojedes",
  LARA: "Lara",
  FALCON: "Falcón",
  NACIONAL: "Nacional",
  OTRO: "Otro",
};

export const REPO_LABELS: Record<string, string> = {
  public: "Con repo público",
  none: "Sin repo",
};

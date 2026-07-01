# Dev Voluntario — Spec FORGE v2

**Dominio:** devvoluntario.com
**Objetivo:** Directorio de iniciativas tecnológicas en respuesta al doblete sísmico de Venezuela (24 jun 2026). No interconectamos APIs; documentamos. El valor está en encontrar solapamientos y huecos vía datos ricos + filtros, y en conectar iniciativas que necesitan manos con devs voluntarios.

---

## 0. Stack confirmado

- Next.js 14 (App Router) · TypeScript
- Prisma 7 + PostgreSQL en Neon (**proyecto Neon nuevo y separado de N.O.D.E.**, plan Free)
- Better Auth — passwordless, magic link por correo
- Resend (envío de magic links)
- Gemini 2.5 Flash (síntesis del análisis)
- GitHub API (hechos duros del repo)
- Deploy en Vercel

Decisión de plataforma: **server-rendered, mobile-first, liviano**. Se va a usar en caliente, desde teléfonos, con conexión inestable. Nada de SPA pesada. Idioma: **español primero** (ES-only para v1; dejar el código preparado para i18n pero no invertir en EN/PT ahora).

---

## 1. Variables de entorno (`.env`)

```
# Neon — proyecto nuevo "dev-voluntario"
DATABASE_URL=            # connection string pooled (?sslmode=require)
DATABASE_URL_UNPOOLED=   # direct, para migraciones

# Better Auth
BETTER_AUTH_SECRET=      # openssl rand -base64 32
BETTER_AUTH_URL=         # dev: http://localhost:3000 · prod: https://devvoluntario.com
NEXT_PUBLIC_APP_URL=     # idem

# Resend
RESEND_API_KEY=
EMAIL_FROM=              # dev: onboarding@resend.dev · prod: hola@devvoluntario.com (tras verificar DNS)

# Análisis
GEMINI_API_KEY=          # key PROPIA de este proyecto, NO la de N.O.D.E.
GITHUB_TOKEN=            # PAT básico (sin scopes) → sube el rate limit de 60/h a 5000/h
```

---

## 2. Esquema Prisma (contrato de datos)

`datasource` con `directUrl` para migraciones en Neon:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DATABASE_URL_UNPOOLED")
}

generator client {
  provider = "prisma-client-js"
}

// ---------- Enums ----------

enum InitiativeStatus {
  IDEA
  IN_DEVELOPMENT
  IN_PRODUCTION
  PAUSED
}

enum RepoVisibility {
  PUBLIC
  PRIVATE
  NONE
}

enum Platform {
  WEB
  MOBILE
  BOT        // WhatsApp / Telegram
  API
  OTHER
}

enum Category {
  RESCUE_SEARCH          // rescate y búsqueda
  MISSING_PERSONS        // personas desaparecidas
  SHELTERS               // refugios y albergues
  DONATIONS_LOGISTICS    // donaciones e insumos
  HEALTH_TELEMEDICINE    // salud y telemedicina
  DAMAGE_MAPPING         // mapeo de daños
  INFO_COMMS             // comunicación e info verificada
  VOLUNTEERING           // voluntariado
  FAMILY_REUNIFICATION   // reunificación familiar
  OPEN_DATA_INFRA        // datos abiertos / infraestructura
}

enum DevRole {
  DESIGN_UX
  FRONTEND
  BACKEND
  QA
  PM_PO
  DATA
  INFRA_DEVOPS
  CONTENT_LEGAL
}

enum Region {
  YARACUY
  CARABOBO
  LA_GUAIRA
  DISTRITO_CAPITAL
  ARAGUA
  COJEDES
  LARA
  FALCON
  NACIONAL
  OTRO
}

enum AuditAction {
  CREATE
  UPDATE
  CLAIM
  REVERT
}

// ---------- App ----------

model Initiative {
  id              String           @id @default(cuid())
  name            String
  tagline         String?
  description     String           @db.Text
  logoUrl         String?

  status          InitiativeStatus @default(IN_DEVELOPMENT)
  repoVisibility  RepoVisibility   @default(NONE)
  repoUrl         String?
  liveUrl         String?
  contactInfo     String?          // correo / handle del owner

  platforms       Platform[]
  techStack       String[]         // tags normalizados
  primaryCategory Category
  secondaryCats   Category[]
  coverage        Region[]

  needsHelp       Boolean          @default(false)
  neededRoles     DevRole[]

  // Claim suave: cualquiera edita, pero queda marcado el dueño
  ownerUserId     String?
  owner           User?            @relation("OwnedInitiatives", fields: [ownerUserId], references: [id])

  createdById     String
  createdBy       User             @relation("CreatedInitiatives", fields: [createdById], references: [id])

  // Resultado crudo del análisis para poder re-analizar
  rawAnalysis     Json?
  lastAnalyzedAt  DateTime?

  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  audit           AuditEntry[]

  @@index([primaryCategory])
  @@index([status])
  @@index([needsHelp])
}

model AuditEntry {
  id            String      @id @default(cuid())
  initiativeId  String
  initiative    Initiative  @relation(fields: [initiativeId], references: [id], onDelete: Cascade)
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  action        AuditAction
  // SOLO el diff, no copias completas: { campo: { from, to } }
  changedFields Json
  createdAt     DateTime    @default(now())

  @@index([initiativeId, createdAt])
}

model Volunteer {
  id             String    @id @default(cuid())
  userId         String    @unique
  user           User      @relation(fields: [userId], references: [id])
  displayName    String
  roles          DevRole[]
  skills         String[]
  availability   String?   // texto libre: "fines de semana", "20h/sem"
  contactPref    String?
  listedPublicly Boolean   @default(true)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}
```

**Tablas de Better Auth** (`user`, `session`, `account`, `verification`): no las escribas a mano. Genera con `npx @better-auth/cli generate` y luego añade al modelo `User` las relaciones inversas que usan los modelos de arriba:

```prisma
// dentro de model User { ... }
ownedInitiatives   Initiative[]  @relation("OwnedInitiatives")
createdInitiatives Initiative[]  @relation("CreatedInitiatives")
auditEntries       AuditEntry[]
volunteer          Volunteer?
```

> Nota de retención: el audit guarda **diffs**, no snapshots. Esto mantiene el storage muy por debajo del cap de 0.5 GB del Free de Neon (que suspende el proyecto si se excede, no cobra).

---

## 3. Auth — Better Auth + magic link

- Plugin `magicLink` de Better Auth; envío vía Resend.
- Handler en `app/api/auth/[...all]/route.ts`.
- Lectura del directorio **pública** (sin login). Login solo se exige para **crear, editar, reclamar** y para **registrarse como voluntario**.
- El magic link da email verificado → cada escritura queda firmada y alimenta el audit log.
- Página `/login`: pide correo, dispara el magic link, muestra estado "revisa tu correo".

**Criterio de aceptación:** un usuario sin sesión puede navegar todo el directorio; al intentar crear/editar lo redirige a `/login`; tras el magic link vuelve a la acción que intentaba.

---

## 4. Rutas / páginas

| Ruta | Auth | Qué hace |
|---|---|---|
| `/` | no | Hero ("Súmate como dev voluntario") + directorio con filtros + lista |
| `/iniciativas/[id]` | no | Ficha completa + bloque "otras en esta categoría/zona" + historial de cambios |
| `/iniciativas/nueva` | sí | Formulario con botón **Analizar** (sitio/repo) |
| `/iniciativas/[id]/editar` | sí | Edición; escribe `AuditEntry` con el diff |
| `/voluntarios` | no (form sí) | Lista de voluntarios públicos + formulario "unirme" |
| `/login` | — | Magic link |
| `/api/analyze` | sí | Pipeline de extracción (ver §5) |
| `/api/auth/[...all]` | — | Better Auth |

**Filtros del directorio** (query params, server-rendered): categoría · estado · repo (público / sin repo) · plataforma · necesita apoyo + rol específico · zona · búsqueda por texto. Combinables. Cada combinación = una URL compartible (clave para pegar en el grupo de WhatsApp).

**Detección de solapamientos v1 = simple y suficiente:** agrupar/filtrar por categoría + en cada ficha mostrar "otras iniciativas en esta misma categoría y/o zona". Nada de matching automático todavía.

---

## 5. Pipeline de análisis (`/api/analyze`)

**Auth requerido** (evita que martillen el endpoint y gastes Gemini). Endpoint **separado y de timeout corto**; nunca bloquea el submit. Botón "Analizar" con loading state y **fallback a entrada manual** si el sitio está caído, detrás de Cloudflare, o se pasa del timeout.

Pipeline:

1. **Input:** `liveUrl` y/o `repoUrl`.
2. **Capa determinística — repo** (si hay repo GitHub público): parsear `owner/repo`; con `GITHUB_TOKEN`:
   - lenguajes (`/languages`)
   - metadata (`pushed_at`, `open_issues_count`, `topics`, `description`)
   - README (contents API)
   - **manifiesto de dependencias** (`package.json`, `requirements.txt`, `go.mod`…) → de aquí sale el backend real (Prisma, drivers, etc.) que el sitio en vivo oculta.
3. **Capa determinística — sitio** (si hay `liveUrl`): fetch HTML → `<head>` (OG, `<title>`, meta description, favicon) + headers (`Server`, `x-vercel-id`, `cf-ray`) + firmas en el body (`/_next/`, `__NUXT__`, `wp-content`…). Set chiquito de firmas a mano para Next / React-Vite / Vue-Nuxt / WordPress; no metas Wappalyzer.
4. **Gemini 2.5 Flash** recibe lo ya masticado (README + manifiesto + lenguajes + texto de la página) y devuelve **JSON estricto** (sin markdown, sin preámbulo): `{ description, suggestedCategory, suggestedTags[], activitySignal }`. `activitySignal` cruza último commit + issues abiertos → "activo" / "posiblemente inactivo".
5. **Respuesta:** sugerencias que **pre-llenan** el formulario con badges "extraído del sitio" / "extraído del repo" / "sugerido por IA". **Nunca autoguardar.** El autor revisa y confirma. Guardar el crudo en `rawAnalysis` + `lastAnalyzedAt`.

Defensa de timeout: `AbortController` por cada llamada externa (~8–10s) y `maxDuration` ajustado en el route segment. Que un sitio lento no tumbe nada.

**Criterio de aceptación:** pegar un repo público válido pre-llena stack, categoría y descripción sin que el usuario escriba; sitio caído → el formulario sigue 100% usable a mano.

---

## 6. Audit log (edición abierta)

Modelo wiki: cualquier usuario autenticado edita cualquier iniciativa. Cada CREATE/UPDATE/CLAIM/REVERT escribe un `AuditEntry` con `userId`, timestamp y el **diff de campos**. La ficha muestra el historial. Implementar **revert** (un `REVERT` es un UPDATE que restaura valores previos y queda registrado). Claim suave: el autor puede marcarse `owner` sin bloquear la edición ajena.

---

## 7. Orden de ejecución para Claude Code

**Independiente del dominio — arrancar YA:**

1. Crear proyecto Neon "dev-voluntario" (nuevo, separado). Copiar las dos connection strings.
2. Repo GitHub + scaffold Next 14 App Router + TS + Prisma + cliente Neon. `prisma db push`.
3. Better Auth + magic link (probar con `onboarding@resend.dev` mientras el DNS procesa).
4. Directorio: read paths + filtros + ficha + bloque de solapamientos.
5. Formularios crear/editar + audit log + revert.
6. Endpoint `/api/analyze` (repo → GitHub API; sitio → head/headers; Gemini síntesis).
7. Sección voluntarios + formulario.
8. Pulido mobile-first, estados de carga, vacíos.
9. Deploy en Vercel sobre la URL `*.vercel.app` (funciona sin el dominio).

**Dependiente del dominio — al tener acceso al DNS:**

10. Añadir `devvoluntario.com` en Vercel y crear los registros A/CNAME que indique Vercel.
11. Verificar `devvoluntario.com` en Resend (registros TXT: SPF, DKIM, DMARC) para enviar magic links desde `@devvoluntario.com`.
12. Actualizar `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `EMAIL_FROM` al dominio real y redeploy.

---

## 8. Fuera de alcance v1

EN/PT (solo ES) · matching automático de solapamientos · moderación pesada / botón reportar · interconexión de APIs entre iniciativas. Todo queda para iteraciones siguientes.

---

## 9. Verificación de dueño de sitio (FAST-FOLLOW — siguiente iteración)

NO construir aún. Registrar para la próxima iteración, junto con el pipeline de
análisis (§5), con el que comparte el fetch del sitio.

**Objetivo:** dar un badge "Dueño verificado" a una iniciativa cuando quien la
reclama demuestra control del dominio. Aumenta confianza y frena vandalismo /
suplantación, sin pedir GitHub ni exponer identidad (compatible con anti-doxeo).

**Método (patrón estándar tipo Google Search Console / Vercel):**
- Al reclamar una iniciativa, generar un token único por iniciativa+usuario
  (ej. `devvoluntario-verify=<hash>`).
- La persona coloca el token en su sitio de una de dos formas:
  (a) meta tag en el <head>:  <meta name="devvoluntario-verify" content="<hash>">
  (b) archivo en ruta conocida: /.well-known/devvoluntario.txt con el token.
- Endpoint hace fetch del sitio (reusa la infra de fetch de §5), busca el token;
  si lo encuentra, marca la iniciativa como verificada y muestra badge.

**Modelo:** se apoya en Initiative.ownerUserId (convierte el "claim" suave en un
claim VERIFICADO). Agregar un campo tipo `ownerVerifiedAt: DateTime?`.

**Qué garantiza y qué no:** prueba CONTROL del dominio, no identidad de la
persona. Suficiente para "dueño del proyecto". No impide que dos miembros del
mismo equipo verifiquen.

**Limitación:** iniciativas SIN sitio propio (bots de Telegram, apps en URL de
terceros) no pueden usar este método; quedan sin verificar o requieren otra vía.

**Cuándo:** después de que el flujo core (login, agregar, editar con audit) esté
sólido y probado con usuarios reales. Construir junto al pipeline de análisis.

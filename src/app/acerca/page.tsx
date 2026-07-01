import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acerca — DeVVoluntario",
  description:
    "Qué es Dev Voluntario, cómo funciona y nuestra política de privacidad",
};

export default function AcercaPage() {
  return (
    <main className="min-h-screen px-s3 py-s5 lg:px-s7 lg:py-s7">
      <div className="max-w-2xl mx-auto">
        <nav className="mb-s5">
          <Link
            href="/"
            className="text-sm text-muted hover:text-fresh-mint transition-colors"
          >
            &larr; Volver al directorio
          </Link>
        </nav>

        <header className="mb-s7">
          <h1
            className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold mb-s2"
            style={{ letterSpacing: "-0.08em" }}
          >
            DeVVoluntario
          </h1>
          <p className="text-muted leading-relaxed text-sm sm:text-base">
            Directorio abierto de iniciativas tecnológicas en respuesta al
            doblete sísmico de Venezuela (junio 2026).
          </p>
        </header>

        {/* ─── Qué es ─── */}
        <Section title="Qué es">
          <p>
            Dev Voluntario es un directorio comunitario que cataloga proyectos de
            software — apps, bots, APIs, plataformas — creados para asistir en la
            respuesta humanitaria tras los terremotos de junio de 2026 en
            Venezuela. Nuestro objetivo es evitar duplicación de esfuerzos y
            facilitar que los voluntarios encuentren dónde aportar.
          </p>
        </Section>

        {/* ─── Cómo funciona ─── */}
        <Section title="Cómo funciona">
          <ul className="space-y-3">
            <Li>
              <strong className="text-foreground">Registrar una iniciativa:</strong>{" "}
              Cualquier persona con cuenta puede agregar un proyecto al
              directorio. Solo necesitas nombre, descripción y categoría.
            </Li>
            <Li>
              <strong className="text-foreground">Buscar apoyo:</strong>{" "}
              Si tu proyecto necesita voluntarios, márcalo como «Necesita apoyo»
              y selecciona los roles que buscas. Aparecerá en la sección de
              voluntarios.
            </Li>
            <Li>
              <strong className="text-foreground">Ofrecer apoyo:</strong>{" "}
              Regístrate como voluntario indicando tus roles y habilidades. El
              sistema conecta las necesidades de las iniciativas con los
              voluntarios disponibles por especialidad.
            </Li>
            <Li>
              <strong className="text-foreground">Modelo wiki:</strong>{" "}
              Cualquier usuario registrado puede editar los datos de cualquier
              iniciativa. Todos los cambios quedan en el historial con
              identificadores anónimos.
            </Li>
          </ul>
        </Section>

        {/* ─── Anti-doxeo ─── */}
        <Section title="Política de privacidad (anti-doxeo)">
          <p className="mb-s3">
            La privacidad de los participantes es una prioridad. Estas son las
            reglas que aplicamos:
          </p>
          <ul className="space-y-3">
            <Li>
              <strong className="text-foreground">Sin nombres reales:</strong>{" "}
              Al crear tu cuenta se te asigna un seudónimo al azar
              (ej: «Amber Capybara 3f»). Este es tu único identificador en la
              plataforma.
            </Li>
            <Li>
              <strong className="text-foreground">Correo nunca visible:</strong>{" "}
              Tu email solo se usa para el enlace de acceso (magic link). Nunca
              se muestra a otros usuarios ni aparece en ninguna página pública.
            </Li>
            <Li>
              <strong className="text-foreground">Sin directorio de voluntarios:</strong>{" "}
              Los voluntarios no se listan públicamente. Solo se muestran
              conteos agregados por especialidad — cuántos hay de cada rol, sin
              nombres ni datos.
            </Li>
            <Li>
              <strong className="text-foreground">Datos de contacto privados:</strong>{" "}
              La preferencia de contacto que registras como voluntario es
              privada. No se muestra en ninguna vista pública.
            </Li>
            <Li>
              <strong className="text-foreground">Historial anónimo:</strong>{" "}
              Las ediciones en el historial de cambios solo muestran el
              seudónimo asignado, nunca información personal.
            </Li>
          </ul>
        </Section>

        {/* ─── No-payment rule ─── */}
        <Section title="Regla de no-pago">
          <p className="mb-s3">
            Dev Voluntario es un directorio sin fines de lucro. Todo el
            trabajo aquí es voluntario.
          </p>
          <ul className="space-y-3">
            <Li>
              <strong className="text-foreground">Ninguna iniciativa debe cobrarte:</strong>{" "}
              Si algún proyecto listado en este directorio te solicita un
              pago por participar como voluntario, repórtalo. Eso va en
              contra de las reglas.
            </Li>
            <Li>
              <strong className="text-foreground">No cobramos comisiones:</strong>{" "}
              Dev Voluntario no cobra ni a iniciativas ni a voluntarios.
              No hay tarifas ocultas ni planes premium.
            </Li>
            <Li>
              <strong className="text-foreground">Sin donaciones integradas:</strong>{" "}
              No manejamos dinero. Si una iniciativa necesita fondos, lo
              gestiona fuera de esta plataforma y bajo su propia
              responsabilidad.
            </Li>
          </ul>
        </Section>

        {/* ─── How volunteer assignment works ─── */}
        <Section title="Cómo funciona la asignación de voluntarios">
          <p className="mb-s3">
            En estos primeros días, la coordinación es manual y
            transparente:
          </p>
          <ol className="space-y-3 list-decimal list-inside">
            <li className="text-muted leading-relaxed">
              <strong className="text-foreground">Te registras</strong>{" "}
              indicando tus roles y habilidades. Se te asigna un seudónimo
              anónimo.
            </li>
            <li className="text-muted leading-relaxed">
              <strong className="text-foreground">Revisamos las iniciativas</strong>{" "}
              que marcaron «Necesita voluntarios» y los roles que buscan.
            </li>
            <li className="text-muted leading-relaxed">
              <strong className="text-foreground">Si hay un match</strong>{" "}
              entre lo que una iniciativa necesita y tu especialidad, te
              contactamos por el medio que indicaste.
            </li>
            <li className="text-muted leading-relaxed">
              <strong className="text-foreground">Tú decides</strong>{" "}
              si quieres participar. No hay obligación ni compromiso.
            </li>
          </ol>
          <p className="mt-s3 text-muted/60 text-sm">
            El objetivo es automatizar este proceso cuando haya masa
            crítica, pero por ahora priorizamos coordinación humana para
            asegurarnos de que funcione bien.
          </p>
        </Section>

        {/* ─── Immediate roadmap ─── */}
        <Section title="Roadmap inmediato">
          <p className="mb-s3">
            Lo que estamos trabajando ahora o planeamos a corto plazo:
          </p>
          <ul className="space-y-3">
            <Li>
              <strong className="text-foreground">Match automático:</strong>{" "}
              Notificar automáticamente a voluntarios cuando una iniciativa
              busque su especialidad.
            </Li>
            <Li>
              <strong className="text-foreground">Verificación de iniciativas:</strong>{" "}
              Marcar los datos que han sido confirmados por sus
              creadores vs. los que son inferidos.
            </Li>
            <Li>
              <strong className="text-foreground">Análisis automático:</strong>{" "}
              Extraer datos de las URLs de las iniciativas para enriquecer
              el directorio (tech stack, estado, etc.).
            </Li>
            <Li>
              <strong className="text-foreground">Métricas de respuesta:</strong>{" "}
              Dashboard público con estadísticas agregadas del ecosistema
              de respuesta tecnológica.
            </Li>
          </ul>
        </Section>

        {/* ─── FAQ ─── */}
        <Section title="Preguntas frecuentes">
          <div className="space-y-s4">
            <Faq q="¿Necesito crear una cuenta?">
              Para consultar el directorio, no. Para registrar una iniciativa,
              editar datos, ofrecer apoyo como voluntario o reclamar autoría de
              un proyecto, sí necesitas iniciar sesión con tu correo
              electrónico.
            </Faq>
            <Faq q="¿Van a ver mi email otros usuarios?">
              No. Tu correo solo se usa para enviarte el enlace de acceso. En
              toda la plataforma apareces únicamente con tu seudónimo asignado.
            </Faq>
            <Faq q="¿Puedo cambiar mi seudónimo?">
              Por ahora los seudónimos se asignan automáticamente y no son
              editables. Esto es intencional para reforzar el anonimato.
            </Faq>
            <Faq q="¿Cualquiera puede editar una iniciativa?">
              Sí, siguiendo un modelo wiki. Todos los cambios quedan
              registrados en el historial de la iniciativa con el seudónimo de
              quien editó.
            </Faq>
            <Faq q="¿Qué significa «Reclamar autoría»?">
              Si una iniciativa fue registrada por otra persona pero tú eres su
              creador o mantenedor, puedes reclamar la autoría. Esto te asocia
              como responsable del proyecto.
            </Faq>
            <Faq q="¿Cómo funciona el match de voluntarios?">
              No es una plataforma de contratación. Las iniciativas indican qué
              roles necesitan y los voluntarios registran sus especialidades.
              Los conteos agregados permiten ver dónde hay talento disponible.
              La coordinación real ocurre fuera de la plataforma.
            </Faq>
            <Faq q="¿Puedo eliminar mis datos?">
              Escríbenos para solicitar la eliminación de tu cuenta y datos
              asociados.
            </Faq>
          </div>
        </Section>

        {/* ─── Footer ─── */}
        <div className="border-t border-border pt-s5 mt-s7 text-sm text-muted/60">
          <p>
            Dev Voluntario es un proyecto de código abierto, creado por la
            comunidad para la comunidad.
          </p>
        </div>
      </div>
    </main>
  );
}

// ─── Helpers ───

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-s7">
      <h2 className="font-serif text-xl font-bold mb-s3">{title}</h2>
      <div className="text-muted leading-relaxed text-sm sm:text-base">
        {children}
      </div>
    </section>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="text-fresh-mint/60 shrink-0 mt-0.5">—</span>
      <span>{children}</span>
    </li>
  );
}

function Faq({
  q,
  children,
}: {
  q: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-bold text-foreground mb-1">{q}</h3>
      <p className="text-muted text-sm leading-relaxed">{children}</p>
    </div>
  );
}

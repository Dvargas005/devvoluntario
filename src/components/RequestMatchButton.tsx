"use client";

import { useState } from "react";
import { requestMatch } from "@/app/actions/matches";

export default function RequestMatchButton({
  initiativeId,
  volunteerId,
  role,
}: {
  initiativeId: string;
  volunteerId: string;
  role: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function handleClick() {
    setStatus("sending");
    try {
      const fd = new FormData();
      fd.set("initiativeId", initiativeId);
      fd.set("volunteerId", volunteerId);
      fd.set("role", role);
      await requestMatch(fd);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <span className="text-xs text-fresh-mint/70">Solicitud enviada</span>
    );
  }

  if (status === "error") {
    return <span className="text-xs text-red-400">Error al enviar</span>;
  }

  return (
    <button
      onClick={handleClick}
      disabled={status === "sending"}
      className="text-xs text-fresh-mint hover:text-foreground transition-colors border border-fresh-mint/30 hover:border-foreground/40 px-2 py-0.5 rounded disabled:opacity-50"
    >
      {status === "sending" ? "Enviando..." : "Solicitar conexión"}
    </button>
  );
}

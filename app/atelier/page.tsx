import React from "react";
import { ClientAuthGate } from "@/app/components/client-auth-gate";
import AtelierClient from "./AtelierClient";

export default function AtelierPage() {
  return (
    <ClientAuthGate allowedRoles={["worker", "admin"]}>
      <AtelierClient />
    </ClientAuthGate>
  );
}

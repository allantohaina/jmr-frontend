import React from "react";
import { ClientAuthGate } from "@/app/components/client-auth-gate";
import BrouillonsClient from "./BrouillonsClient";

export default function BrouillonsPage() {
  return (
    <ClientAuthGate allowedRoles={["worker", "admin"]}>
      <BrouillonsClient />
    </ClientAuthGate>
  );
}
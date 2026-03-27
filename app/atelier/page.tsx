import React from "react";
import { getCurrentUser } from "../lib/auth-server";
import { redirect } from "next/navigation";
import AtelierClient from "./AtelierClient";

export default async function AtelierPage() {
  const user = await getCurrentUser();
  
  // PRIVILEGE CHECK: Only worker or admin can access
  if (!user || (user.role !== "worker" && user.role !== "admin")) {
    redirect("/");
  }

  return <AtelierClient />;
}

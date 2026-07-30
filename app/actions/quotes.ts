"use server";

import { redirect } from "next/navigation";
import { authAPI } from "@/app/lib";

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function sendQuoteRequest(formData: FormData) {
  const body: Record<string, string> = {
    name: readText(formData, "name"),
    email: readText(formData, "email"),
    phone: readText(formData, "phone"),
    message: readText(formData, "message"),
    tissu: readText(formData, "tissu"),
    coupe: readText(formData, "coupe"),
    gabarit: readText(formData, "gabarit"),
    style: readText(formData, "style"),
    grammage: readText(formData, "grammage"),
    tailles: readText(formData, "tailles"),
    quantite: readText(formData, "quantite"),
    finitions: readText(formData, "finitions"),
    delai_souhaite: readText(formData, "delai_souhaite"),
    modify_code: readText(formData, "modify_code"),
    request_type: readText(formData, "request_type") || (readText(formData, "modify_code") ? "edit" : "new"),
    category: readText(formData, "category"),
  };

  await authAPI.post("/quotes", body);

  redirect("/suivi-projet?view=tracking&step=2");
}

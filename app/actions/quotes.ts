"use server";

import { redirect } from "next/navigation";
import { authAPI } from "../lib/api";

export async function sendQuoteRequest(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const message = formData.get("message") as string;
  const tissu = formData.get("tissu") as string;
  const coupe = formData.get("coupe") as string;
  const gabarit = formData.get("gabarit") as string;
  const style = formData.get("style") as string;
  const grammage = formData.get("grammage") as string;
  const tailles = formData.get("tailles") as string;
  const quantite = formData.get("quantite") as string;
  const finitions = formData.get("finitions") as string;
  const delaiSouhaite = formData.get("delai_souhaite") as string;

  await authAPI.post("/quotes", {
    name,
    email,
    phone,
    message,
    tissu,
    coupe,
    gabarit,
    style,
    grammage,
    tailles,
    quantite,
    finitions,
    delai_souhaite: delaiSouhaite,
  });

  redirect("/suivi-projet?view=tracking&step=2");
}

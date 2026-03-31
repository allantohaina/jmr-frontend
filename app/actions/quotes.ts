"use server";

import { redirect } from "next/navigation";
import { authAPI } from "@/app/lib";

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
  const modifyCode = formData.get("modify_code") as string;
  const category = formData.get("category") as string;
  const files = formData.getAll("technical_files") as File[];

  const apiFormData = new FormData();
  apiFormData.append("name", name);
  apiFormData.append("email", email);
  apiFormData.append("phone", phone);
  apiFormData.append("message", message);
  apiFormData.append("tissu", tissu);
  apiFormData.append("coupe", coupe);
  apiFormData.append("gabarit", gabarit);
  apiFormData.append("style", style);
  apiFormData.append("grammage", grammage);
  apiFormData.append("tailles", tailles);
  apiFormData.append("quantite", quantite);
  apiFormData.append("finitions", finitions);
  apiFormData.append("delai_souhaite", delaiSouhaite);
  apiFormData.append("modify_code", modifyCode);
  apiFormData.append("category", category);

  files.forEach((file, index) => {
    if (file.size > 0) {
      apiFormData.append(`technical_files[${index}]`, file);
    }
  });

  await authAPI.post("/quotes", apiFormData);

  redirect("/suivi-projet?view=tracking&step=2");
}

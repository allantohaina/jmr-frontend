import { redirect } from "next/navigation";

export default function AdminHoneypot() {
  // En production, ici on enverrait un log au serveur
  console.warn("[SECURITY ALERT] Unauthorized access attempt to legacy /admin URL.");
  
  // Redirection vers la page de connexion
  redirect("/");
}

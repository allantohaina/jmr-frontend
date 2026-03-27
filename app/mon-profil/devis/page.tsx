import { DevisSection } from "../../components/mon-profil/devis-section";
import { authAPI, type QuoteRecord } from "../../lib/api";
import { getCurrentUser } from "../../lib/auth-server";

export default async function DevisPage() {
  const user = await getCurrentUser();
  let quotes: QuoteRecord[] = [];

  if (user) {
    const response = await authAPI.get<QuoteRecord[]>(`/users/${user.id}/quotes`);
    quotes = response.data;
  }

  return <DevisSection quotes={quotes} />;
}

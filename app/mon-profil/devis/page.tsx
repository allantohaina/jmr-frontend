import { MonProfilComponents } from "@/app/components";
import { authAPI, type QuoteRecord, getCurrentUser } from "@/app/lib";

export default async function DevisPage() {
  const user = await getCurrentUser();
  let quotes: QuoteRecord[] = [];

  if (user) {
    const response = await authAPI.get<QuoteRecord[]>(`/users/${user.id}/quotes`);
    quotes = response.data;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Mes devis</h1>
      <MonProfilComponents.DevisSection quotes={quotes} />
    </div>
  );
}

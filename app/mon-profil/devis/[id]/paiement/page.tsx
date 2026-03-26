import { PaiementSection } from "../../../../components/mon-profil/paiement-section";

export default function PaiementPage({ params }: { params: { id: string } }) {
  return <PaiementSection id={params.id} />;
}

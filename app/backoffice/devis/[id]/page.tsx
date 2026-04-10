import { EditDevisSection } from "../../../components/admin/edit-devis-section";

export default function EditDevisPage({ params }: { params: { id: string } }) {
  return <EditDevisSection id={params.id} />;
}

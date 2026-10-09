import { getPatientById } from "@/actions";
import { notFound } from "next/navigation";
import { PatientDetailView } from "@/components/patients/patient-detail-view";

export default async function PatientDetailPage(props: PageProps<"/patients/[id]">) {
  const { id } = await props.params;
  const patient = await getPatientById(id);

  if (!patient) {
    notFound();
  }

  return <PatientDetailView patient={patient as any} />;
}

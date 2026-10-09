import { getPatients } from "@/actions";
import { PatientList } from "@/components/patients/patient-list";

export default async function PatientsPage() {
  const patients = await getPatients();

  return <PatientList initialPatients={patients as any} />;
}

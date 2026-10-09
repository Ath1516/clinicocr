import { getPatients } from "@/actions";
import { UploadWorkspace } from "@/components/upload/upload-workspace";

export default async function UploadPage(props: PageProps<"/upload">) {
  const searchParams = await props.searchParams;
  const patientId = typeof searchParams?.patientId === "string" ? searchParams.patientId : undefined;

  const rawPatients = await getPatients();
  const patients = rawPatients.map((p) => ({
    id: p.id,
    name: p.name,
    age: p.age,
    phone: p.phone,
  }));

  return <UploadWorkspace patients={patients} initialPatientId={patientId} />;
}

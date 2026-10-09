import { searchPrescriptions } from "@/actions";
import { SearchView } from "@/components/search/search-view";

export default async function SearchPage() {
  // Fetch initial recent prescriptions for immediate browsing
  const initialResults = await searchPrescriptions(" ");

  return <SearchView initialResults={initialResults as any} />;
}

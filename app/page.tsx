import { HomeContent } from "@/components/home-content";
import { getSessionUser } from "@/lib/session";

type PageProps = {
  searchParams: Promise<{ created?: string; updated?: string }>;
};

export default async function HomePage({ searchParams }: PageProps) {
  const { created, updated } = await searchParams;
  const user = await getSessionUser();
  return (
    <HomeContent
      showIntakeCreated={created === "1"}
      showIntakeUpdated={updated === "1"}
      isLoggedIn={user != null}
    />
  );
}

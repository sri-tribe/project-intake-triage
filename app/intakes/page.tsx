import { redirect } from "next/navigation";
import { IntakesList } from "@/components/intakes-list";
import { getPrisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function IntakesPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const intakes = await getPrisma().intake.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: "desc" },
  });

  const rows = intakes.map((i) => ({
    id: i.id,
    title: i.title,
    industry: i.industry,
    createdAt: i.createdAt.toISOString(),
  }));

  return <IntakesList intakes={rows} />;
}

import { AdminAllIntakesHeader } from "@/components/admin-all-intakes-header";
import { AdminAllIntakesTable } from "@/components/admin-all-intakes-table";
import { getPrisma } from "@/lib/prisma";
import { Stack } from "@mui/material";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const intakes = await getPrisma().intake.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  const rows = intakes.map((i) => ({
    id: i.id,
    title: i.title,
    industry: i.industry,
    createdAtIso: i.createdAt.toISOString(),
    user: i.user,
  }));

  return (
    <Stack spacing={2}>
      <AdminAllIntakesHeader intakes={rows} />
      <AdminAllIntakesTable intakes={rows} />
    </Stack>
  );
}

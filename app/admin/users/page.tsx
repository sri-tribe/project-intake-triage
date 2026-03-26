import { AdminUsersTable } from "@/components/admin-users-table";
import { getPrisma } from "@/lib/prisma";
import { Stack, Typography } from "@mui/material";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await getPrisma().user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      isAdmin: true,
      createdAt: true,
      _count: { select: { intakes: true } },
    },
  });

  const rows = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    isAdmin: u.isAdmin,
    createdAtIso: u.createdAt.toISOString(),
    intakeCount: u._count.intakes,
  }));

  return (
    <Stack spacing={2}>
      <div>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          Users
        </Typography>
        <Typography variant="body2" color="text.secondary">
          All registered accounts (passwords are never shown).
        </Typography>
      </div>
      <AdminUsersTable users={rows} />
    </Stack>
  );
}

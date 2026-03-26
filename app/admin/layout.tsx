import { AdminSubNav } from "@/components/admin-sub-nav";
import { requireAdmin } from "@/lib/admin-auth";
import { Stack } from "@mui/material";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <Stack spacing={3}>
      <AdminSubNav />
      {children}
    </Stack>
  );
}

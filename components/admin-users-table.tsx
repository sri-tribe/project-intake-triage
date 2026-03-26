import {
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAtIso: string;
  intakeCount: number;
};

export function AdminUsersTable({ users }: { users: AdminUserRow[] }) {
  if (users.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          No registered users
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mx: "auto" }}>
          Accounts show up here after someone registers or you run the seed script. Use{" "}
          <strong>Register</strong> on the home page to create the first user.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ overflowX: "auto" }}>
      <Table size="small" sx={{ minWidth: 560 }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell align="right">Intakes</TableCell>
            <TableCell>Joined</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>{row.name}</TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-all" }}>
                  {row.email}
                </Typography>
              </TableCell>
              <TableCell>
                {row.isAdmin ? (
                  <Chip label="Admin" size="small" color="warning" variant="outlined" />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    User
                  </Typography>
                )}
              </TableCell>
              <TableCell align="right">{row.intakeCount}</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                {new Date(row.createdAtIso).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

import { redirect } from "next/navigation";
import { RegisterPageView } from "@/components/register-page-view";
import { getSessionUser } from "@/lib/session";

export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user) {
    redirect(user.isAdmin ? "/admin" : "/intakes");
  }

  return <RegisterPageView />;
}

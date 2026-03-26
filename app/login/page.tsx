import { redirect } from "next/navigation";
import { LoginPageView } from "@/components/login-page-view";
import { getSessionUser } from "@/lib/session";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) {
    redirect(user.isAdmin ? "/admin" : "/intakes");
  }

  return <LoginPageView />;
}

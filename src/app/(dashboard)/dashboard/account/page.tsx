import { redirect } from "next/navigation";
import { getSession } from "@/libs/session";
import { AccountPanel } from "./_components/account-panel";

export default async function AccountPage() {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold">Account</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie a segurança e o ciclo de vida da sua conta.
        </p>
      </div>
      <AccountPanel email={user.email} />
    </div>
  );
}

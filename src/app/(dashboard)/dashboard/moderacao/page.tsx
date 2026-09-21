import { redirect } from "next/navigation";

import { getSessionUser } from "@/libs/auth-server";
import { UsersList } from "./_components/users-list";

const MODERATOR_ROLE = "moderator";

export default async function ModeracaoPage() {
  const user = await getSessionUser();

  if (user?.role !== MODERATOR_ROLE) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold">Moderação</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie usuários, papéis e acessos da plataforma.
        </p>
      </div>
      <UsersList />
    </div>
  );
}

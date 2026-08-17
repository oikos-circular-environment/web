import { redirect } from "next/navigation";

import { getSession } from "@/libs/session";
import { UsersList } from "./_components/users-list";
import { getUsersAction } from "./actions";

const MODERATOR_ROLE = "moderator";

export default async function ModeracaoPage() {
  const user = await getSession();

  if (user?.role !== MODERATOR_ROLE) {
    redirect("/dashboard");
  }

  const initialData = await getUsersAction({
    limit: 10,
    offset: 0,
    sortBy: "created_at",
    sortDirection: "desc",
  });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold">Moderação</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie usuários, papéis e acessos da plataforma.
        </p>
      </div>
      <UsersList initialData={initialData} />
    </div>
  );
}

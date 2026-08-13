"use client";

import {
  BanIcon,
  MoreHorizontalIcon,
  ShieldIcon,
  TrashIcon,
  UserXIcon,
} from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";

import { useUsersList } from "@/components/moderacao/hooks/use-users-list";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const USERS_LIMIT = 10;

type UsersListProps = {
  initialData?: Awaited<ReturnType<typeof import("../actions").getUsersAction>>;
};

export function UsersList({ initialData }: UsersListProps) {
  const searchId = useId();
  const {
    users,
    total,
    isLoading,
    offset,
    setOffset,
    searchValue,
    setSearchValue,
    updateRole,
    ban,
    unban,
    revokeSessions,
    remove,
    isBanning,
    isUnbanning,
    isUpdatingRole,
    isRevokingSessions,
    isRemoving,
  } = useUsersList(initialData);

  const [dialog, setDialog] = useState<
    | { type: "ban"; userId: string; email: string }
    | { type: "remove"; userId: string; email: string }
    | null
  >(null);

  const totalPages = Math.ceil(total / USERS_LIMIT);
  const currentPage = Math.floor(offset / USERS_LIMIT) + 1;

  async function handleRoleChange(id: string, role: string) {
    try {
      await updateRole({ id, role });
      toast.success("Papel atualizado.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar papel.",
      );
    }
  }

  async function handleBan(id: string) {
    try {
      await ban({ id });
      toast.success("Usuário banido.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao banir usuário.",
      );
    } finally {
      setDialog(null);
    }
  }

  async function handleUnban(id: string) {
    try {
      await unban(id);
      toast.success("Usuário desbanido.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao desbanir usuário.",
      );
    }
  }

  async function handleRevokeSessions(id: string) {
    try {
      await revokeSessions(id);
      toast.success("Sessões revogadas.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao revogar sessões.",
      );
    }
  }

  async function handleRemove(id: string) {
    try {
      await remove(id);
      toast.success("Usuário removido.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao remover usuário.",
      );
    } finally {
      setDialog(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from(
          { length: USERS_LIMIT },
          (_, index) => `skeleton-${index}`,
        ).map((key) => (
          <Skeleton key={key} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Input
          id={searchId}
          type="search"
          placeholder="Buscar por e-mail"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              setOffset(0);
            }
          }}
          className="max-w-sm"
        />
        <Button variant="secondary" onClick={() => setOffset(0)}>
          Buscar
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name ?? "—"}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      user.role === "moderator" ? "default" : "secondary"
                    }
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.banned ? (
                    <Badge variant="destructive">Banido</Badge>
                  ) : (
                    <Badge variant="outline">Ativo</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Ações">
                        <MoreHorizontalIcon />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {user.role !== "moderator" ? (
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(user.id, "moderator")}
                          disabled={isUpdatingRole}
                        >
                          <ShieldIcon />
                          Tornar moderador
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(user.id, "user")}
                          disabled={isUpdatingRole}
                        >
                          <UserXIcon />
                          Remover moderador
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {user.banned ? (
                        <DropdownMenuItem
                          onClick={() => handleUnban(user.id)}
                          disabled={isUnbanning}
                        >
                          <BanIcon />
                          Desbanir
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() =>
                            setDialog({
                              type: "ban",
                              userId: user.id,
                              email: user.email,
                            })
                          }
                          disabled={isBanning}
                          variant="destructive"
                        >
                          <BanIcon />
                          Banir
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleRevokeSessions(user.id)}
                        disabled={isRevokingSessions}
                      >
                        <UserXIcon />
                        Revogar sessões
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          setDialog({
                            type: "remove",
                            userId: user.id,
                            email: user.email,
                          })
                        }
                        disabled={isRemoving}
                        variant="destructive"
                      >
                        <TrashIcon />
                        Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() =>
                  setOffset((current) => Math.max(0, current - USERS_LIMIT))
                }
                aria-disabled={offset === 0}
                className={
                  offset === 0 ? "pointer-events-none opacity-50" : undefined
                }
              />
            </PaginationItem>
            <PaginationItem>
              <span className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setOffset((current) =>
                    current + USERS_LIMIT >= total
                      ? current
                      : current + USERS_LIMIT,
                  )
                }
                aria-disabled={offset + USERS_LIMIT >= total}
                className={
                  offset + USERS_LIMIT >= total
                    ? "pointer-events-none opacity-50"
                    : undefined
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <AlertDialog
        open={dialog?.type === "ban"}
        onOpenChange={(open) => !open && setDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Banir usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja banir <strong>{dialog?.email}</strong>?
              Essa ação pode ser desfeita posteriormente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => dialog?.type === "ban" && handleBan(dialog.userId)}
            >
              Banir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={dialog?.type === "remove"}
        onOpenChange={(open) => !open && setDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{dialog?.email}</strong>?
              Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() =>
                dialog?.type === "remove" && handleRemove(dialog.userId)
              }
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

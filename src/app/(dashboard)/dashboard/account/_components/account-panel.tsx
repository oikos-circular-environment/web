"use client";

import { useActionState, useId, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

import {
  type ChangePasswordFormState,
  cancelAccountDeletionAction,
  changePasswordAction,
  requestAccountDeletionAction,
} from "../actions";

const initialPasswordState: ChangePasswordFormState = { status: "idle" };

function ChangePasswordCard() {
  const currentPasswordId = useId();
  const newPasswordId = useId();
  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    initialPasswordState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Senha</CardTitle>
        <CardDescription>
          Sua sessão atual e outras sessões ativas continuam válidas depois da
          troca.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} noValidate>
          <FieldGroup>
            <Field data-invalid={state.status === "error"}>
              <FieldLabel htmlFor={currentPasswordId}>Senha atual</FieldLabel>
              <Input
                id={currentPasswordId}
                name="currentPassword"
                type="password"
                autoComplete="current-password"
              />
            </Field>

            <Field data-invalid={state.status === "error"}>
              <FieldLabel htmlFor={newPasswordId}>Nova senha</FieldLabel>
              <Input
                id={newPasswordId}
                name="newPassword"
                type="password"
                autoComplete="new-password"
              />
            </Field>

            {state.status === "error" && (
              <FieldError errors={[{ message: state.error }]} />
            )}
            {state.status === "success" && (
              <p className="text-sm text-primary">
                Senha alterada com sucesso.
              </p>
            )}

            <Button type="submit" disabled={isPending} className="w-fit">
              {isPending ? "Salvando" : "Salvar nova senha"}
              {isPending && <Spinner data-icon="inline-end" />}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

function DeleteAccountCard() {
  const [isPending, startTransition] = useTransition();
  const [deletedAt, setDeletedAt] = useState<string | null>(null);

  function handleDelete() {
    startTransition(async () => {
      const result = await requestAccountDeletionAction();
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setDeletedAt(result.deletedAt);
      toast.info("Exclusão de conta agendada.");
    });
  }

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelAccountDeletionAction();
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setDeletedAt(null);
      toast.success("Exclusão de conta cancelada.");
    });
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle>Excluir conta</CardTitle>
        <CardDescription>
          Sua conta é agendada para exclusão após um período de carência — você
          pode cancelar até lá.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {deletedAt ? (
          <>
            <p className="text-sm text-muted-foreground">
              Exclusão agendada para{" "}
              <strong>{new Date(deletedAt).toLocaleString("pt-BR")}</strong>.
            </p>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={handleCancel}
              className="w-fit"
            >
              {isPending ? "Cancelando" : "Cancelar exclusão"}
              {isPending && <Spinner data-icon="inline-end" />}
            </Button>
          </>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                disabled={isPending}
                className="w-fit"
              >
                Excluir conta
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir sua conta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Isso agenda a exclusão da sua conta após um período de
                  carência. Você pode cancelar antes desse prazo.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={handleDelete}>
                  Excluir conta
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardContent>
    </Card>
  );
}

export function AccountPanel({ email }: { email: string }) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>E-mail</CardTitle>
          <CardDescription>{email}</CardDescription>
        </CardHeader>
      </Card>
      <ChangePasswordCard />
      <DeleteAccountCard />
    </div>
  );
}

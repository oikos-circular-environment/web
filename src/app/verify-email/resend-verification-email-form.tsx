"use client";

import { SendIcon } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  type ResendVerificationEmailState,
  resendVerificationEmailAction,
} from "./actions";

const initialState: ResendVerificationEmailState = { status: "idle" };

export function ResendVerificationEmailForm() {
  const [state, formAction, isPending] = useActionState(
    resendVerificationEmailAction,
    initialState,
  );

  if (state.status === "success") {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="w-full">
      <FieldGroup>
        <Field data-invalid={state.status === "error"}>
          <FieldLabel htmlFor="resend-email" className="sr-only">
            E-mail
          </FieldLabel>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="resend-email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              required
              aria-invalid={state.status === "error"}
              disabled={isPending}
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? "Enviando" : "Reenviar e-mail"}
              {isPending ? (
                <Spinner data-icon="inline-end" />
              ) : (
                <SendIcon data-icon="inline-end" />
              )}
            </Button>
          </div>
          {state.status === "error" && <FieldError>{state.message}</FieldError>}
        </Field>
      </FieldGroup>
    </form>
  );
}

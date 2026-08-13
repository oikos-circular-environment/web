"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  type ProfileFormInput,
  useProfile,
} from "@/components/profile/hooks/use-profile";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

const MAX_NAME_LENGTH = 120;
const MAX_DISPLAY_NAME_LENGTH = 120;
const MAX_PHONE_LENGTH = 20;

const phoneRegex = /^\+?\d[\d\s()-]{7,}\d$/;

const profileFormSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, "Informe seu nome completo.")
    .max(
      MAX_NAME_LENGTH,
      `O nome deve ter no máximo ${MAX_NAME_LENGTH} caracteres.`,
    ),
  display_name: z
    .string()
    .trim()
    .min(1, "Informe seu nome de exibição.")
    .max(
      MAX_DISPLAY_NAME_LENGTH,
      `O nome de exibição deve ter no máximo ${MAX_DISPLAY_NAME_LENGTH} caracteres.`,
    ),
  phone: z
    .string()
    .trim()
    .min(1, "Informe seu telefone.")
    .max(
      MAX_PHONE_LENGTH,
      `O telefone deve ter no máximo ${MAX_PHONE_LENGTH} caracteres.`,
    )
    .regex(phoneRegex, "Informe um telefone válido."),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

type ProfileFormProps = {
  initialData?: Awaited<
    ReturnType<
      typeof import("@/app/(dashboard)/dashboard/profile/actions").getProfileAction
    >
  >;
};

export function ProfileForm({ initialData }: ProfileFormProps) {
  const fullNameId = useId();
  const displayNameId = useId();
  const phoneId = useId();

  const { profile, isLoading, updateProfile, isUpdating } =
    useProfile(initialData);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    values: profile
      ? {
          full_name: profile.full_name,
          display_name: profile.display_name,
          phone: profile.phone,
        }
      : undefined,
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateProfile(values satisfies ProfileFormInput);
      toast.success("Perfil atualizado com sucesso.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar suas alterações. Tente novamente.",
      );
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.full_name}>
          <FieldLabel htmlFor={fullNameId}>Nome completo</FieldLabel>
          <Input
            id={fullNameId}
            type="text"
            autoComplete="name"
            aria-invalid={!!errors.full_name}
            placeholder="Seu nome completo"
            {...register("full_name")}
          />
          <FieldError errors={[errors.full_name]} />
        </Field>

        <Field data-invalid={!!errors.display_name}>
          <FieldLabel htmlFor={displayNameId}>Nome de exibição</FieldLabel>
          <Input
            id={displayNameId}
            type="text"
            autoComplete="nickname"
            aria-invalid={!!errors.display_name}
            placeholder="Como quer ser chamado"
            {...register("display_name")}
          />
          <FieldError errors={[errors.display_name]} />
        </Field>

        <Field data-invalid={!!errors.phone}>
          <FieldLabel htmlFor={phoneId}>Telefone</FieldLabel>
          <Input
            id={phoneId}
            type="tel"
            autoComplete="tel"
            aria-invalid={!!errors.phone}
            placeholder="(11) 91234-5678"
            {...register("phone")}
          />
          <FieldError errors={[errors.phone]} />
        </Field>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isUpdating}>
            {isUpdating ? "Salvando" : "Salvar alterações"}
            {isUpdating && <Spinner data-icon="inline-end" />}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}

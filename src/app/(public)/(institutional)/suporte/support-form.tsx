"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { FileTextIcon, SendIcon, UploadIcon, XIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitSupportRequest } from "@/hooks/use-submit-support-request";

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 2500;
const MAX_FILES = 5;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg"];

const supportFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Informe um título.")
    .max(MAX_TITLE_LENGTH, `Máximo de ${MAX_TITLE_LENGTH} caracteres.`),
  description: z
    .string()
    .trim()
    .min(1, "Descreva o problema.")
    .max(
      MAX_DESCRIPTION_LENGTH,
      `Máximo de ${MAX_DESCRIPTION_LENGTH} caracteres.`,
    ),
  email: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail.")
    .pipe(z.email("Informe um e-mail válido.")),
});

type SupportFormValues = z.infer<typeof supportFormSchema>;

type ImageAttachment = {
  id: string;
  file: File;
  previewUrl: string;
};

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024;
    return `${kb.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} KB`;
  }

  const mb = bytes / (1024 * 1024);
  return `${mb.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`;
}

type SupportFormProps = {
  turnstileSiteKey: string;
  defaultEmail: string;
};

export function SupportForm({
  turnstileSiteKey,
  defaultEmail,
}: SupportFormProps) {
  const titleId = useId();
  const emailId = useId();
  const descriptionId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const { resolvedTheme } = useTheme();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SupportFormValues>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: { title: "", description: "", email: defaultEmail },
  });

  const [images, setImages] = useState<ImageAttachment[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isChallengeSolved, setIsChallengeSolved] = useState(false);
  const submitSupportRequest = useSubmitSupportRequest();

  const description = watch("description");

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;

    const accepted: File[] = [];
    for (const file of Array.from(fileList)) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`"${file.name}" não é PNG, JPG ou JPEG.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`"${file.name}" excede o limite de 10 MB.`);
        continue;
      }
      accepted.push(file);
    }

    if (accepted.length === 0) return;

    setImages((current) => {
      const availableSlots = MAX_FILES - current.length;
      if (availableSlots <= 0) {
        toast.error(`Você já atingiu o máximo de ${MAX_FILES} arquivos.`);
        return current;
      }

      const toAdd = accepted.slice(0, availableSlots);
      if (accepted.length > toAdd.length) {
        toast.error(
          `Apenas ${toAdd.length} de ${accepted.length} arquivos foram adicionados — máximo de ${MAX_FILES} arquivos.`,
        );
      }

      return [
        ...current,
        ...toAdd.map((file) => ({
          id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
          file,
          previewUrl: URL.createObjectURL(file),
        })),
      ];
    });
  }

  function removeImage(id: string) {
    setImages((current) => {
      const target = current.find((image) => image.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((image) => image.id !== id);
    });
  }

  function resetForm() {
    images.forEach((image) => {
      URL.revokeObjectURL(image.previewUrl);
    });
    setImages([]);
    reset();
  }

  const onSubmit = handleSubmit(async (values) => {
    const turnstileToken = turnstileRef.current?.getResponse();

    if (!turnstileToken) {
      toast.error(
        "Aguarde a verificação de segurança concluir antes de enviar.",
      );
      return;
    }

    try {
      await submitSupportRequest.mutateAsync({
        title: values.title,
        description: values.description,
        email: values.email,
        images: images.map((image) => image.file),
        turnstileToken,
      });

      toast.success(
        "Solicitação enviada! Nossa equipe vai te responder em breve.",
      );
      resetForm();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar sua solicitação. Tente novamente.",
      );
    } finally {
      // Cada token vale uma verificação só - sem o reset, uma segunda tentativa
      // seria recusada pelo siteverify como token duplicado.
      setIsChallengeSolved(false);
      turnstileRef.current?.reset();
    }
  });

  return (
    <Card>
      <CardContent>
        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Field data-invalid={!!errors.title}>
              <FieldLabel htmlFor={titleId}>Título</FieldLabel>
              <Input
                id={titleId}
                aria-invalid={!!errors.title}
                maxLength={MAX_TITLE_LENGTH}
                placeholder="Resuma o problema em poucas palavras"
                {...register("title")}
              />
              <FieldError errors={[errors.title]} />
            </Field>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor={emailId}>E-mail</FieldLabel>
              <Input
                id={emailId}
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                placeholder="voce@exemplo.com"
                {...register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>

            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor={descriptionId}>Descrição</FieldLabel>
              <Textarea
                id={descriptionId}
                rows={6}
                maxLength={MAX_DESCRIPTION_LENGTH}
                aria-invalid={!!errors.description}
                placeholder="Descreva o que aconteceu, com o máximo de detalhes possível"
                {...register("description")}
              />
              <FieldDescription className="text-right">
                {description?.length ?? 0} / {MAX_DESCRIPTION_LENGTH}
              </FieldDescription>
              <FieldError errors={[errors.description]} />
            </Field>

            <Field>
              <FieldLabel>Imagens (opcional)</FieldLabel>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDraggingOver(true);
                }}
                onDragLeave={() => setIsDraggingOver(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDraggingOver(false);
                  addFiles(event.dataTransfer.files);
                }}
                data-state={isDraggingOver ? "uploading" : "idle"}
                className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-lg border border-dashed border-input bg-transparent p-8 text-center transition-colors data-[state=uploading]:border-primary data-[state=uploading]:bg-primary/5"
              >
                <UploadIcon className="size-7 text-muted-foreground" />
                <p className="text-sm font-medium">
                  Arraste imagens aqui ou clique para selecionar
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Badge variant="outline">PNG, JPG ou JPEG</Badge>
                  <Badge variant="outline">
                    {images.length}/{MAX_FILES} arquivos
                  </Badge>
                  <Badge variant="outline">10MB</Badge>
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                multiple
                tabIndex={-1}
                aria-hidden="true"
                className="sr-only"
                onChange={(event) => {
                  addFiles(event.target.files);
                  event.target.value = "";
                }}
              />

              {images.length > 0 && (
                <div className="flex flex-col gap-2 pt-1">
                  {images.map((image) => (
                    <Attachment key={image.id} className="w-full">
                      <AttachmentMedia>
                        <FileTextIcon />
                      </AttachmentMedia>
                      <AttachmentContent>
                        <AttachmentTitle>{image.file.name}</AttachmentTitle>
                        <AttachmentDescription>
                          {formatFileSize(image.file.size)}
                        </AttachmentDescription>
                      </AttachmentContent>
                      <AttachmentActions>
                        <AttachmentAction
                          type="button"
                          aria-label={`Remover ${image.file.name}`}
                          onClick={() => removeImage(image.id)}
                        >
                          <XIcon />
                        </AttachmentAction>
                      </AttachmentActions>
                    </Attachment>
                  ))}
                </div>
              )}
            </Field>

            <Field>
              <div className="flex justify-center">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={turnstileSiteKey}
                  options={{
                    language: "pt-br",
                    theme: resolvedTheme === "dark" ? "dark" : "light",
                    refreshExpired: "manual",
                  }}
                  onSuccess={() => setIsChallengeSolved(true)}
                  onExpire={() => {
                    setIsChallengeSolved(false);
                    turnstileRef.current?.reset();
                  }}
                  onError={() => {
                    setIsChallengeSolved(false);
                    toast.error(
                      "Falha na verificação de segurança. Recarregue a página e tente novamente.",
                    );
                  }}
                />
              </div>
            </Field>

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={isSubmitting}
                onClick={resetForm}
              >
                Limpar formulário
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || !isChallengeSolved}
                title={
                  isChallengeSolved
                    ? undefined
                    : "Conclua a verificação de segurança para enviar."
                }
              >
                {isSubmitting ? "Enviando" : "Enviar solicitação"}
                {isSubmitting ? (
                  <Spinner data-icon="inline-end" />
                ) : (
                  <SendIcon data-icon="inline-end" />
                )}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

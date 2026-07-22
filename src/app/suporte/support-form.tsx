"use client";

import { FileTextIcon, SendIcon, UploadIcon, XIcon } from "lucide-react";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";

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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const MAX_DESCRIPTION_LENGTH = 2500;
const MAX_FILES = 5;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg"];

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

export function SupportForm() {
  const titleId = useId();
  const descriptionId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

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
    setTitle("");
    setDescription("");
    setImages([]);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 600));

    toast.success(
      "Solicitação enviada! Nossa equipe vai te responder em breve.",
    );
    resetForm();
    setIsSubmitting(false);
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={titleId}>Título</FieldLabel>
              <Input
                id={titleId}
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Resuma o problema em poucas palavras"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor={descriptionId}>Descrição</FieldLabel>
              <Textarea
                id={descriptionId}
                required
                rows={6}
                maxLength={MAX_DESCRIPTION_LENGTH}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Descreva o que aconteceu, com o máximo de detalhes possível"
              />
              <FieldDescription className="text-right">
                {description.length} / {MAX_DESCRIPTION_LENGTH}
              </FieldDescription>
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
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar solicitação"}
                <SendIcon data-icon="inline-end" />
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

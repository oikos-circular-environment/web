"use client";

import { XIcon } from "lucide-react";
import Image from "next/image";
import { useId, useState } from "react";
import { toast } from "sonner";

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

type ImageAttachment = {
  id: string;
  file: File;
  previewUrl: string;
};

export function SupportForm() {
  const titleId = useId();
  const descriptionId = useId();
  const imagesId = useId();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList) return;

    const newImages = Array.from(fileList).map((file) => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImages((current) => [...current, ...newImages]);
  }

  function removeImage(id: string) {
    setImages((current) => {
      const target = current.find((image) => image.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((image) => image.id !== id);
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 600));

    toast.success(
      "Solicitação enviada! Nossa equipe vai te responder em breve.",
    );
    setTitle("");
    setDescription("");
    images.forEach((image) => {
      URL.revokeObjectURL(image.previewUrl);
    });
    setImages([]);
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
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Descreva o que aconteceu, com o máximo de detalhes possível"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor={imagesId}>Imagens (opcional)</FieldLabel>
              <Input
                id={imagesId}
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => handleFilesSelected(event.target.files)}
              />
              <FieldDescription>
                Anexe capturas de tela que ajudem a entender o problema.
              </FieldDescription>

              {images.length > 0 && (
                <ul className="grid grid-cols-3 gap-3 pt-1 sm:grid-cols-4">
                  {images.map((image) => (
                    <li
                      key={image.id}
                      className="group relative aspect-square overflow-hidden rounded-md border"
                    >
                      <Image
                        src={image.previewUrl}
                        alt={image.file.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        aria-label={`Remover ${image.file.name}`}
                        className="absolute top-1 right-1 rounded-full bg-background/80 p-1 text-foreground opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <XIcon className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Field>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar solicitação"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

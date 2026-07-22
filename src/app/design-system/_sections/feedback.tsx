"use client";

import {
  FileTextIcon,
  InboxIcon,
  TerminalIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
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
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { ShowcaseBlock, ShowcaseSection } from "../_components/showcase";

export function FeedbackSection() {
  return (
    <ShowcaseSection
      id="feedback"
      title="Feedback"
      description="Alertas, badges, progresso, skeleton, spinner, tooltip e notificações (Sonner)."
    >
      <ShowcaseBlock title="Alert" className="flex-col items-stretch gap-3">
        <Alert>
          <TerminalIcon />
          <AlertTitle>Coleta agendada</AlertTitle>
          <AlertDescription>
            Sua coleta foi confirmada pra amanhã às 09:00.
          </AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>Falha ao enviar denúncia</AlertTitle>
          <AlertDescription>
            Tente novamente em alguns minutos.
          </AlertDescription>
          <AlertAction>
            <Button size="sm" variant="outline">
              Tentar de novo
            </Button>
          </AlertAction>
        </Alert>
      </ShowcaseBlock>

      <ShowcaseBlock title="Badge">
        <Badge>Padrão</Badge>
        <Badge variant="secondary">Secundário</Badge>
        <Badge variant="destructive">Destrutivo</Badge>
        <Badge variant="outline">Contorno</Badge>
        <Badge variant="ghost">Ghost</Badge>
      </ShowcaseBlock>

      <ShowcaseBlock title="Progress / Spinner / Skeleton">
        <Progress value={65} className="w-48" />
        <Spinner />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </ShowcaseBlock>

      <ShowcaseBlock title="Attachment">
        <Attachment className="w-64">
          <AttachmentMedia>
            <FileTextIcon />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>relatorio-coleta.pdf</AttachmentTitle>
            <AttachmentDescription>1,2 MB</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction aria-label="Remover">
              <XIcon />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      </ShowcaseBlock>

      <ShowcaseBlock title="Empty state">
        <Empty className="w-full max-w-md border-0 bg-transparent p-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <InboxIcon />
            </EmptyMedia>
            <EmptyTitle>Nenhuma coleta ainda</EmptyTitle>
            <EmptyDescription>
              Quando você agendar uma coleta, ela aparece aqui.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm">Agendar coleta</Button>
          </EmptyContent>
        </Empty>
      </ShowcaseBlock>

      <ShowcaseBlock title="Tooltip / Sonner (toast)">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Passe o mouse</Button>
          </TooltipTrigger>
          <TooltipContent>Dica contextual</TooltipContent>
        </Tooltip>
        <Button
          variant="outline"
          onClick={() =>
            toast("Coleta confirmada", {
              description: "Amanhã às 09:00, Vila Madalena.",
            })
          }
        >
          Disparar toast (Sonner)
        </Button>
      </ShowcaseBlock>
    </ShowcaseSection>
  );
}

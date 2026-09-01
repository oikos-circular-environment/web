"use client";

import type * as React from "react";

import { GlassButton } from "@/components/landing-page/ui/glass-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function StoreLinkDialog({
  href,
  icon,
  label,
  qrSrc,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  qrSrc: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <GlassButton
          tone="glass"
          className="h-14 w-full justify-start gap-3 rounded-2xl px-5 text-base"
        >
          {icon}
          {label}
        </GlassButton>
      </DialogTrigger>

      <DialogContent className="flex w-fit flex-col items-center gap-4 border border-foreground/10 bg-background/70 text-center backdrop-blur-2xl">
        <DialogHeader className="items-center">
          <DialogTitle>{label}</DialogTitle>
        </DialogHeader>

        <div className="size-40 rounded-xl bg-white p-3">
          {/* biome-ignore lint/performance/noImgElement: data URI gerada no servidor, next/image não otimiza esse caso */}
          <img alt={label} className="size-full" src={qrSrc} />
        </div>

        <DialogDescription className="max-w-56">
          Escaneie o QR code com a câmera do celular para abrir na loja.
        </DialogDescription>

        <DialogFooter className="w-full">
          <DialogClose asChild>
            <Button asChild className="w-full" size="lg">
              <a href={href} rel="noopener noreferrer" target="_blank">
                Continuar navegação
              </a>
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { StoreLinkDialog };

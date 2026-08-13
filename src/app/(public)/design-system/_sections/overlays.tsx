"use client";

import { ChevronDownIcon, MoreHorizontalIcon } from "lucide-react";
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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { ShowcaseBlock, ShowcaseSection } from "../_components/showcase";

export function OverlaysSection() {
  return (
    <ShowcaseSection
      id="overlays"
      title="Overlays"
      description="Dialog, sheet, popover, hover card, dropdown e menubar."
    >
      <ShowcaseBlock title="Dialog">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Abrir dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar coleta</DialogTitle>
              <DialogDescription>
                Essa ação agenda a coleta pra amanhã às 09:00.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button>Confirmar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ShowcaseBlock>

      <ShowcaseBlock title="Alert Dialog">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Cancelar coleta</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancelar essa coleta?</AlertDialogTitle>
              <AlertDialogDescription>
                Essa ação não pode ser desfeita. A cooperativa será notificada.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Voltar</AlertDialogCancel>
              <AlertDialogAction>Cancelar coleta</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ShowcaseBlock>

      <ShowcaseBlock title="Sheet">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Abrir sheet</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filtrar coletas</SheetTitle>
              <SheetDescription>Ajuste os filtros do mapa.</SheetDescription>
            </SheetHeader>
            <SheetFooter>
              <Button>Aplicar</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </ShowcaseBlock>

      <ShowcaseBlock title="Popover / Hover Card">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Abrir popover</Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 text-sm">
            Conteúdo contextual, fecha ao clicar fora.
          </PopoverContent>
        </Popover>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link">Cooperativa Vila Verde</Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-64 text-sm">
            Cooperativa parceira desde 2023, especializada em papel e papelão.
          </HoverCardContent>
        </HoverCard>
      </ShowcaseBlock>

      <ShowcaseBlock title="Dropdown Menu / Menubar">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Ações <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Coleta #1234</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Editar</DropdownMenuItem>
            <DropdownMenuItem>Duplicar</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Cancelar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>
              Arquivo <ChevronDownIcon className="ml-1 size-3" />
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Novo</MenubarItem>
              <MenubarItem>Abrir</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Exportar</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </ShowcaseBlock>
    </ShowcaseSection>
  );
}

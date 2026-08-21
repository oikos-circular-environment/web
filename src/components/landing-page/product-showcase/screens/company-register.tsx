"use client";

import { Factory, Pencil, Search } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function CompanyRegisterScreen() {
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-white p-4">
      <div className="relative mb-12">
        <div className="h-28 rounded-md bg-primary" />

        <div className="absolute left-1/2 top-24 -ml-8 -mt-8">
          <div className="relative">
            <Avatar className="h-16 w-16 rounded-md shadow-lg">
              <AvatarImage src="" />
              <AvatarFallback className="rounded-md bg-secondary">
                <Factory className="h-9 w-9 text-lime-800" />
              </AvatarFallback>
            </Avatar>
            <Button
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full p-0"
              size="icon-xs"
              variant="secondary"
            >
              <Pencil className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      <Card className="shadow-none" size="sm">
        <div className="flex items-start gap-3">
          <Checkbox id="use-profile" />
          <div className="flex flex-col gap-1">
            <Label className="text-sm" htmlFor="use-profile">
              Utilizar os dados do meu perfil
            </Label>
            <p className="text-xs text-muted-foreground">
              O seu CPF não será exposto publicamente. Garantimos a privacidade
              dos seus dados pessoais.
            </p>
          </div>
        </div>
      </Card>

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <Label>Tipo de identidade</Label>
          <div className="flex flex-row gap-2">
            <Button className="flex-1" variant="default">
              CNPJ
            </Button>
            <Button className="flex-1" variant="outline">
              CPF
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Identidade</Label>
          <div className="relative">
            <Input
              defaultValue="12.345.678/0001-90"
              placeholder="00.000.000/0000-00"
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              type="button"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Tipo de empresa</Label>
          <Select defaultValue="COMPANY">
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="COMPANY">Empresa</SelectItem>
              <SelectItem value="ONG">ONG</SelectItem>
              <SelectItem value="GOVERNMENT">Governo</SelectItem>
              <SelectItem value="COLLECTOR">Coletor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Razão social</Label>
          <Input
            defaultValue="EcoRecicla Santos LTDA"
            placeholder="Nome completo da empresa"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Nome fantasia</Label>
          <Input
            defaultValue="EcoRecicla"
            placeholder="Nome fantasia (opcional)"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>E-mail</Label>
          <Input
            defaultValue="contato@ecorecicla.br"
            placeholder="contato@empresa.com"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Telefone Principal</Label>
          <Input defaultValue="(13) 99999-9999" placeholder="(00) 00000-0000" />
        </div>

        <div className="mt-2 flex gap-2">
          <Button className="flex-1" variant="outline">
            Limpar
          </Button>
          <Button className="flex-1">Cadastrar</Button>
        </div>
      </div>
    </div>
  );
}

export { CompanyRegisterScreen };

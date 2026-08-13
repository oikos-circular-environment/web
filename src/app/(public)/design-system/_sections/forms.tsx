"use client";

import { CreditCardIcon, SearchIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { ShowcaseBlock, ShowcaseSection } from "../_components/showcase";

const MATERIAIS = [
  "Papel",
  "Plástico",
  "Metal",
  "Vidro",
  "Orgânico",
  "Eletrônico",
];

export function FormsSection() {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <ShowcaseSection
      id="formularios"
      title="Formulários"
      description="Botões, campos e controles de entrada."
    >
      <ShowcaseBlock title="Button — variantes">
        <Button variant="default">Padrão</Button>
        <Button variant="outline">Contorno</Button>
        <Button variant="secondary">Secundário</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destrutivo</Button>
        <Button variant="link">Link</Button>
      </ShowcaseBlock>

      <ShowcaseBlock title="Button — tamanhos">
        <Button size="xs">Extra pequeno</Button>
        <Button size="sm">Pequeno</Button>
        <Button size="default">Padrão</Button>
        <Button size="lg">Grande</Button>
        <Button size="icon" aria-label="Buscar">
          <SearchIcon />
        </Button>
      </ShowcaseBlock>

      <ShowcaseBlock title="Button Group">
        <ButtonGroup>
          <Button variant="outline">Semana</Button>
          <Button variant="outline">Mês</Button>
          <Button variant="outline">Ano</Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button variant="outline" size="icon" aria-label="Cartão">
            <CreditCardIcon />
          </Button>
          <ButtonGroupSeparator />
          <Button variant="outline">Pagar</Button>
        </ButtonGroup>
      </ShowcaseBlock>

      <ShowcaseBlock
        title="Input / Textarea"
        className="flex-col items-stretch gap-4"
      >
        <Field>
          <FieldLabel htmlFor="ds-input">E-mail</FieldLabel>
          <Input id="ds-input" type="email" placeholder="voce@empresa.com" />
          <FieldDescription>Usamos pra confirmar sua coleta.</FieldDescription>
        </Field>
        <Field data-invalid>
          <FieldLabel htmlFor="ds-input-error">CPF</FieldLabel>
          <Input
            id="ds-input-error"
            aria-invalid
            placeholder="000.000.000-00"
          />
          <FieldError>CPF inválido.</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="ds-textarea">Observações</FieldLabel>
          <Textarea id="ds-textarea" placeholder="Detalhes da coleta" />
        </Field>
      </ShowcaseBlock>

      <ShowcaseBlock title="Input Group">
        <InputGroup className="w-64">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput placeholder="Buscar cooperativa" />
        </InputGroup>
      </ShowcaseBlock>

      <ShowcaseBlock title="Input OTP">
        <InputOTP maxLength={4}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
      </ShowcaseBlock>

      <ShowcaseBlock title="Select / Combobox">
        <FieldGroup className="w-56">
          <Field>
            <FieldLabel htmlFor="ds-select">Categoria (Select)</FieldLabel>
            <Select>
              <SelectTrigger id="ds-select">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {MATERIAIS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
        <Combobox items={MATERIAIS}>
          <ComboboxInput placeholder="Categoria (Combobox)" className="w-56" />
          <ComboboxContent>
            <ComboboxEmpty>Nenhum resultado.</ComboboxEmpty>
            <ComboboxList>
              {(item: string) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </ShowcaseBlock>

      <ShowcaseBlock title="Checkbox / Radio / Switch / Toggle">
        <div className="flex items-center gap-2">
          <Checkbox id="ds-checkbox" defaultChecked />
          <Label htmlFor="ds-checkbox">Aceito os termos</Label>
        </div>
        <RadioGroup defaultValue="empresa" className="flex flex-row gap-4">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="empresa" id="ds-radio-empresa" />
            <Label htmlFor="ds-radio-empresa">Empresa</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="cooperativa" id="ds-radio-cooperativa" />
            <Label htmlFor="ds-radio-cooperativa">Cooperativa</Label>
          </div>
        </RadioGroup>
        <div className="flex items-center gap-2">
          <Switch id="ds-switch" defaultChecked />
          <Label htmlFor="ds-switch">Notificações</Label>
        </div>
        <Toggle aria-label="Favoritar">Favoritar</Toggle>
        <ToggleGroup type="single" defaultValue="lista">
          <ToggleGroupItem value="lista">Lista</ToggleGroupItem>
          <ToggleGroupItem value="mapa">Mapa</ToggleGroupItem>
        </ToggleGroup>
      </ShowcaseBlock>

      <ShowcaseBlock title="Calendar / Date Picker">
        <Calendar mode="single" className="rounded-lg border border-border" />
        <DatePicker date={date} onDateChange={setDate} />
      </ShowcaseBlock>

      <ShowcaseBlock title="Separator" className="flex-col items-stretch">
        <span className="text-sm">Seção A</span>
        <Separator />
        <span className="text-sm">Seção B</span>
      </ShowcaseBlock>
    </ShowcaseSection>
  );
}

"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ShowcaseBlock, ShowcaseSection } from "../_components/showcase";

const CHART_DATA = [
  { categoria: "Papel", kg: 420 },
  { categoria: "Plástico", kg: 280 },
  { categoria: "Metal", kg: 150 },
  { categoria: "Vidro", kg: 190 },
  { categoria: "Orgânico", kg: 340 },
];

const CHART_CONFIG = {
  kg: { label: "kg coletados", color: "var(--chart-2)" },
} satisfies ChartConfig;

const COLETAS = [
  { id: "#1234", material: "Papel", status: "Confirmada", peso: "12 kg" },
  { id: "#1235", material: "Plástico", status: "Pendente", peso: "8 kg" },
  { id: "#1236", material: "Metal", status: "Confirmada", peso: "5 kg" },
];

export function DataDisplaySection() {
  return (
    <ShowcaseSection
      id="dados"
      title="Exibição de dados"
      description="Avatar, card, tabela, gráfico, aspect ratio e item."
    >
      <ShowcaseBlock title="Avatar">
        <Avatar>
          <AvatarFallback>OK</AvatarFallback>
        </Avatar>
        <AvatarGroup>
          <Avatar>
            <AvatarFallback>AN</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>BR</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>CS</AvatarFallback>
          </Avatar>
        </AvatarGroup>
      </ShowcaseBlock>

      <ShowcaseBlock title="Card">
        <Card className="w-80">
          <CardHeader>
            <CardTitle>Coleta agendada</CardTitle>
            <CardDescription>Vila Madalena, São Paulo</CardDescription>
            <CardAction>
              <Button size="sm" variant="ghost">
                Editar
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Amanhã, 09:00 — 12 kg de papel e papelão.
          </CardContent>
          <CardFooter>
            <Button size="sm">Confirmar</Button>
          </CardFooter>
        </Card>
      </ShowcaseBlock>

      <ShowcaseBlock title="Item">
        <ItemGroup className="w-full max-w-md gap-2">
          <Item variant="outline">
            <ItemMedia>
              <Avatar>
                <AvatarFallback>CV</AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Cooperativa Vila Verde</ItemTitle>
              <ItemDescription>Papel, papelão e plástico</ItemDescription>
            </ItemContent>
          </Item>
        </ItemGroup>
      </ShowcaseBlock>

      <ShowcaseBlock title="Table">
        <Table className="w-full max-w-lg">
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Peso</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {COLETAS.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.id}</TableCell>
                <TableCell>{c.material}</TableCell>
                <TableCell>{c.status}</TableCell>
                <TableCell className="text-right">{c.peso}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ShowcaseBlock>

      <ShowcaseBlock title="Chart">
        <ChartContainer config={CHART_CONFIG} className="h-56 w-full max-w-lg">
          <BarChart data={CHART_DATA}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="categoria" tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="kg" fill="var(--color-kg)" radius={4} />
          </BarChart>
        </ChartContainer>
      </ShowcaseBlock>

      <ShowcaseBlock title="Aspect Ratio">
        <AspectRatio
          ratio={16 / 9}
          className="w-64 overflow-hidden rounded-lg bg-muted"
        >
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            16:9
          </div>
        </AspectRatio>
      </ShowcaseBlock>
    </ShowcaseSection>
  );
}

"use client";

import { KeyRoundIcon, MonitorSmartphoneIcon } from "lucide-react";

import { useUserDetails } from "@/components/moderacao/hooks/use-user-details";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

const PROVIDER_LABELS: Record<string, string> = {
  credential: "E-mail e senha",
};

function formatDateTime(value: string | Date): string {
  return new Date(value).toLocaleString("pt-BR");
}

function providerLabel(providerId: string): string {
  return (
    PROVIDER_LABELS[providerId] ??
    providerId.charAt(0).toUpperCase() + providerId.slice(1)
  );
}

function userInitials(user: { name: string | null; email: string }): string {
  if (user.name) {
    return user.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }
  return user.email.charAt(0).toUpperCase();
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate text-right font-medium">{value}</span>
    </div>
  );
}

type UserDetailsDrawerProps = {
  userId: string | null;
  onOpenChange: (open: boolean) => void;
};

export function UserDetailsDrawer({
  userId,
  onOpenChange,
}: UserDetailsDrawerProps) {
  const { user, profile, accounts, sessions, isLoading } =
    useUserDetails(userId);

  return (
    <Sheet open={userId !== null} onOpenChange={onOpenChange}>
      <SheetContent className="data-[side=right]:inset-y-4 data-[side=right]:right-4 data-[side=right]:h-auto data-[side=right]:w-full data-[side=right]:max-w-md data-[side=right]:rounded-xl data-[side=right]:border data-[side=right]:shadow-2xl data-[side=right]:sm:max-w-md">
        {isLoading || !user ? (
          <div className="flex flex-col gap-4 p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <>
            <SheetHeader>
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarImage
                    src={user.image ?? undefined}
                    alt={user.name ?? user.email}
                  />
                  <AvatarFallback>{userInitials(user)}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col">
                  <SheetTitle className="truncate">
                    {user.name ?? "Usuário"}
                  </SheetTitle>
                  <SheetDescription className="truncate">
                    {user.email}
                  </SheetDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge
                  variant={user.role === "moderator" ? "default" : "secondary"}
                >
                  {user.role}
                </Badge>
                {user.banned ? (
                  <Badge variant="destructive">Banido</Badge>
                ) : (
                  <Badge variant="outline">Ativo</Badge>
                )}
                {user.email_verified && (
                  <Badge variant="outline">E-mail verificado</Badge>
                )}
              </div>
            </SheetHeader>

            <div className="flex flex-col gap-6 overflow-y-auto px-4 pb-4">
              <Section title="Conta">
                <Field label="Origem" value={user.auth_source} />
                <Field
                  label="Criado em"
                  value={formatDateTime(user.created_at)}
                />
                <Field
                  label="Atualizado em"
                  value={formatDateTime(user.updated_at)}
                />
              </Section>

              {user.banned && (
                <>
                  <Separator />
                  <Section title="Banimento">
                    <Field
                      label="Motivo"
                      value={user.ban_reason ?? "Não informado"}
                    />
                    <Field
                      label="Expira em"
                      value={
                        user.ban_expires
                          ? formatDateTime(user.ban_expires)
                          : "Permanente"
                      }
                    />
                  </Section>
                </>
              )}

              <Separator />

              <Section title="Profile">
                {profile ? (
                  <>
                    <Field label="Nome completo" value={profile.full_name} />
                    <Field
                      label="Nome de exibição"
                      value={profile.display_name}
                    />
                    <Field label="Telefone" value={profile.phone} />
                    {profile.address && (
                      <Field
                        label="Endereço"
                        value={`${profile.address.city}/${profile.address.state_code}`}
                      />
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Usuário ainda não cadastrou um profile.
                  </p>
                )}
              </Section>

              <Separator />

              <Section title="Métodos de login">
                {accounts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum método vinculado.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {accounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center gap-2 rounded-md border p-2 text-sm"
                      >
                        <KeyRoundIcon className="size-4 text-muted-foreground" />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate font-medium">
                            {providerLabel(account.provider_id)}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            Vinculado em {formatDateTime(account.created_at)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Separator />

              <Section title="Sessões ativas">
                {sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma sessão ativa.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-start gap-2 rounded-md border p-2 text-sm"
                      >
                        <MonitorSmartphoneIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="truncate font-medium">
                            {session.ip_address ?? "IP não registrado"}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {session.user_agent ?? "User-agent não registrado"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Expira em {formatDateTime(session.expires_at)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

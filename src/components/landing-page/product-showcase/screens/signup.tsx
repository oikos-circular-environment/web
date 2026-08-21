"use client";

import { ArrowLeft, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SignUpScreen() {
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-white">
      <div className="relative h-72 overflow-hidden rounded-b-4xl">
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 340 288"
        >
          <defs>
            <radialGradient
              cx="50%"
              cy="-3%"
              gradientUnits="userSpaceOnUse"
              id="signupGradient"
              r="200"
            >
              <stop offset="0%" stopColor="#84cc16" />
              <stop offset="100%" stopColor="#3f6212" />
            </radialGradient>
          </defs>
          <rect fill="url(#signupGradient)" height="288" width="340" />
        </svg>

        <div className="relative flex h-full flex-col justify-between px-8 pb-8 pt-14">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white"
            type="button"
          >
            <ArrowLeft className="h-[18px] w-[18px] text-lime-800" />
          </button>

          <div className="flex flex-col gap-2">
            <p className="font-heading text-4xl text-white">
              VAMOS CONSTRUIR O FUTURO JUNTOS!
            </p>
            <p className="text-lg text-white/90">
              Crie sua conta e comece a contribuir.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 px-8 pb-8 pt-10">
        <div className="flex flex-col gap-2">
          <Label className="font-medium text-gray-500">E-mail</Label>
          <Input placeholder="seu@email.com" type="email" />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="font-medium text-gray-500">Senha</Label>
          <div className="relative">
            <Input className="pr-9" placeholder="••••••••" type="password" />
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              type="button"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="font-medium text-gray-500">Confirmar Senha</Label>
          <div className="relative">
            <Input className="pr-9" placeholder="••••••••" type="password" />
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              type="button"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>

        <Button>Criar Conta</Button>

        <div className="flex flex-row justify-center gap-1 pt-2">
          <span className="text-gray-500">Já tem uma conta?</span>
          <span className="font-bold text-gray-900">Entrar</span>
        </div>
      </div>
    </div>
  );
}

export { SignUpScreen };

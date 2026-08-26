import type { Metadata } from "next";

import { DeviceFrame } from "@/components/landing-page/product-showcase/device-frame";
import { MockIdentityProvider } from "@/components/landing-page/product-showcase/mock-identity/mock-identity-context";
import { PersonaPicker } from "@/components/landing-page/product-showcase/mock-identity/persona-picker";
import { screens } from "@/components/landing-page/product-showcase/screens/registry";

export const metadata: Metadata = {
  title: "Device Preview",
  description:
    "Vitrine isolada das telas do device frame do Produto em Ação, tela por tela, pra comparar com o app antes de entrar na landing.",
  robots: { index: false, follow: false },
};

export default function DevicePreviewPage() {
  return (
    <MockIdentityProvider>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <div className="flex flex-col gap-4">
          <h1 className="font-heading text-4xl font-bold tracking-tight">
            Device Preview
          </h1>
          <PersonaPicker />
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
          {screens.map((screen) => (
            <div className="flex flex-col items-center gap-4" key={screen.id}>
              <DeviceFrame>
                <screen.Component />
              </DeviceFrame>
              <div className="text-center">
                <h2 className="font-heading text-lg font-semibold">
                  {screen.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {screen.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MockIdentityProvider>
  );
}

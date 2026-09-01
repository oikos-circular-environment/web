import { Globe } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";

import {
  APP_STORE_PATH_D,
  GOOGLE_PLAY_PATH_D,
} from "@/components/landing-page/closing/store-badge-icons";
import { HeroMapBackground } from "@/components/landing-page/hero/hero-map-background";
import { GlassButton } from "@/components/landing-page/ui/glass-button";
import { GlassPanel } from "@/components/landing-page/ui/glass-panel";
import { Reveal } from "@/components/landing-page/ui/reveal";

import { StoreLinkDialog } from "./_components/store-link-dialog";

const ANDROID_URL =
  "https://play.google.com/store/apps/details?id=com.oikos&hl=pt_BR";
const IOS_URL =
  "https://apps.apple.com/br/app/oikos-economia-circular/id6786017565";

export const metadata: Metadata = {
  title: "Oikos",
  description: "Website, app na App Store e no Google Play.",
  alternates: { canonical: "/bio" },
};

function StoreIcon({ d }: { d: string }) {
  return (
    <svg
      aria-hidden="true"
      className="size-[22px] shrink-0"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d={d} />
    </svg>
  );
}

export default function BioPage() {
  return (
    <section className="relative flex h-dvh min-h-dvh w-full flex-col overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <HeroMapBackground />
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-6">
        <Reveal className="w-full max-w-sm">
          <GlassPanel
            tone="dark"
            className="flex flex-col items-center gap-6 border border-foreground/10 bg-background/35 p-8 text-center"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="size-18 overflow-hidden rounded-full ring-1 ring-foreground/10">
                <Image
                  alt="Oikos"
                  className="size-full object-cover"
                  height={72}
                  src="/oikos-logo.png"
                  width={72}
                />
              </div>

              <div className="flex flex-col items-center gap-1">
                <h1 className="font-heading text-xl">Oikos</h1>
                <p className="text-sm text-muted-foreground">
                  Economia circular de resíduos
                </p>
              </div>
            </div>

            <BioLinks />
          </GlassPanel>
        </Reveal>
      </div>
    </section>
  );
}

async function BioLinks() {
  const [appStoreQr, googlePlayQr] = await Promise.all([
    QRCode.toDataURL(IOS_URL, {
      margin: 0,
      width: 256,
      color: { dark: "#000000", light: "#0000" },
    }),
    QRCode.toDataURL(ANDROID_URL, {
      margin: 0,
      width: 256,
      color: { dark: "#000000", light: "#0000" },
    }),
  ]);

  return (
    <div className="flex w-full flex-col gap-3">
      <GlassButton
        asChild
        tone="glass"
        className="h-14 w-full justify-start gap-3 rounded-2xl px-5 text-base"
      >
        <Link href="/">
          <Globe className="size-[22px] shrink-0" />
          Website
        </Link>
      </GlassButton>

      <StoreLinkDialog
        href={IOS_URL}
        icon={<StoreIcon d={APP_STORE_PATH_D} />}
        label="App Store"
        qrSrc={appStoreQr}
      />

      <StoreLinkDialog
        href={ANDROID_URL}
        icon={<StoreIcon d={GOOGLE_PLAY_PATH_D} />}
        label="Google Play"
        qrSrc={googlePlayQr}
      />
    </div>
  );
}

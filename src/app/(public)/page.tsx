import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-32 text-center">
      <Image
        src="/oikos-logo.png"
        alt="Oikos"
        width={96}
        height={96}
        priority
        className="rounded-2xl"
      />
      <div className="flex flex-col items-center gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Oikos
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          Estamos em construção. Volte em breve.
        </p>
      </div>
    </div>
  );
}

import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t py-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-4 px-6 text-center sm:flex-row sm:justify-between">
        <span className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Oikos. Todos os direitos reservados.
        </span>

        <div className="flex items-center gap-4">
          <Link
            href="/termos-de-uso"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Termos de Uso
          </Link>
          <Link
            href="/politica-de-privacidade"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Política de Privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
}

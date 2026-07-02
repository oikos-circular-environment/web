export function SiteFooter() {
  return (
    <footer className="border-t py-6">
      <div className="mx-auto w-full max-w-5xl px-6 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Oikos. Todos os direitos reservados.
      </div>
    </footer>
  );
}

import type { LegalDocMeta } from "@/lib/legal-doc";

export function LegalDocMetaBlock({ meta }: { meta: LegalDocMeta }) {
  return (
    <div className="mx-auto mb-8 flex w-full max-w-3xl flex-col gap-0.5 text-xs text-muted-foreground">
      {meta.versao && <p>Versão: {meta.versao}</p>}
      {meta.vigencia && <p>Vigência: {meta.vigencia}</p>}
      {meta.atualizacao && <p>Última atualização: {meta.atualizacao}</p>}
    </div>
  );
}

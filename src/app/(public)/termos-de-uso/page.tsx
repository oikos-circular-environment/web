import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";

import { LegalDocMetaBlock } from "@/components/legal-doc-meta";
import { MarkdownContent } from "@/components/markdown-content";
import { parseLegalDoc } from "@/lib/legal-doc";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos de Uso do aplicativo Oikos.",
  alternates: { canonical: "/termos-de-uso" },
};

export default async function TermsOfUsePage() {
  const filePath = path.join(
    process.cwd(),
    "src/content/legal/terms-of-use.md",
  );
  const raw = await readFile(filePath, "utf-8");
  const { meta, content } = parseLegalDoc(raw);

  return (
    <div className="px-6 py-16">
      <LegalDocMetaBlock meta={meta} />
      <MarkdownContent content={content} />
    </div>
  );
}

import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";

import { MarkdownContent } from "@/components/markdown-content";

export const metadata: Metadata = {
  title: "Termos de Uso | Oikos",
  description: "Termos de Uso do aplicativo Oikos.",
};

export default async function TermsOfUsePage() {
  const filePath = path.join(
    process.cwd(),
    "src/content/legal/terms-of-use.md",
  );
  const content = await readFile(filePath, "utf-8");

  return (
    <div className="px-6 py-16">
      <MarkdownContent content={content} />
    </div>
  );
}

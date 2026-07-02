import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";

import { MarkdownContent } from "@/components/markdown-content";

export const metadata: Metadata = {
  title: "Política de Privacidade | Oikos",
  description: "Política de Privacidade do aplicativo Oikos.",
};

export default async function PrivacyPolicyPage() {
  const filePath = path.join(
    process.cwd(),
    "src/content/legal/privacy-policy.md",
  );
  const content = await readFile(filePath, "utf-8");

  return (
    <div className="px-6 py-16">
      <MarkdownContent content={content} />
    </div>
  );
}

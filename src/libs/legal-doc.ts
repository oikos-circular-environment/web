export type LegalDocMeta = {
  versao?: string;
  vigencia?: string;
  atualizacao?: string;
};

const META_BLOCK = /^<!--\s*([\s\S]*?)-->\s*/;

export function parseLegalDoc(raw: string): {
  meta: LegalDocMeta;
  content: string;
} {
  const match = raw.match(META_BLOCK);
  if (!match) {
    return { meta: {}, content: raw };
  }

  const meta: LegalDocMeta = {};
  for (const line of match[1].split("\n")) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (key === "versao" || key === "vigencia" || key === "atualizacao") {
      if (value) meta[key] = value;
    }
  }

  return { meta, content: raw.slice(match[0].length) };
}

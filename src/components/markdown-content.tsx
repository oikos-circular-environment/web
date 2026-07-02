import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const internalDocLinks: Record<string, string> = {
  "./privacy-policy.md": "/politica-de-privacidade",
  "./terms-of-use.md": "/termos-de-uso",
};

function resolveHref(href?: string) {
  if (!href) return href;
  return internalDocLinks[href] ?? href;
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mt-0 mb-4 font-heading text-3xl font-semibold tracking-tight">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-10 mb-3 font-heading text-xl font-semibold tracking-tight">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 mb-2 font-heading text-lg font-semibold">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-4 leading-7 text-foreground/90">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 list-disc space-y-1 pl-6">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-decimal space-y-1 pl-6">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="leading-7 text-foreground/90">{children}</li>
  ),
  a: ({ children, href }) => (
    <a
      href={resolveHref(href)}
      className="font-medium text-primary underline underline-offset-4"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  hr: () => <hr className="my-8 border-border" />,
  blockquote: ({ children }) => (
    <blockquote className="mb-4 border-l-2 border-primary pl-4 text-foreground/80 italic">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
      {children}
    </code>
  ),
  table: ({ children }) => (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="border-b">{children}</thead>,
  th: ({ children }) => (
    <th className="border border-border bg-muted px-3 py-2 text-left font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-border px-3 py-2 align-top">{children}</td>
  ),
};

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

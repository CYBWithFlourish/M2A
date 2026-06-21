export function MarkdownPanel({ config }: { config: any }) {
  return (
    <textarea
      defaultValue={config.content || "## Notes\n\nAdd your runbook notes here..."}
      className="w-full h-32 resize-none rounded border border-border bg-transparent p-2 text-[11px] text-foreground"
      placeholder="Markdown content..."
    />
  );
}

import { useState, useRef, useCallback } from "react";
import { useWorkflow } from "@/lib/workflow-context";

interface Suggestion {
  label: string;
  value: string;
  description: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "input" | "textarea";
  rows?: number;
  className?: string;
}

export function MemoryReferenceAutocomplete({ value, onChange, placeholder, type = "textarea", rows = 4, className = "" }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const { nodes } = useWorkflow();

  const getSuggestions = useCallback((text: string, cursorPos: number) => {
    const before = text.slice(0, cursorPos);
    const match = before.match(/\{\{([^}]*)$/);
    if (!match) return [];

    const partial = match[1].toLowerCase();

    const fields: Suggestion[] = [];
    nodes.forEach((n: any) => {
      if (n.config?.output) {
        fields.push({
          label: `${n.id} output`,
          value: `{{ ${n.id}.output }}`,
          description: `Latest output from node ${n.id}`,
        });
      }
      if (n.type) {
        fields.push({
          label: `${n.id}.type`,
          value: `{{ ${n.id}.type }}`,
          description: `Node type: ${n.type}`,
        });
      }
    });

    fields.push(
      { label: "trigger.input", value: "{{ trigger.input }}", description: "Workflow input text" },
      { label: "trigger.timestamp", value: "{{ trigger.timestamp }}", description: "Trigger timestamp" },
    );

    return fields.filter(f => f.label.toLowerCase().includes(partial));
  }, [nodes]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    const cursorPos = e.target.selectionStart || 0;
    const suggs = getSuggestions(newValue, cursorPos);
    setSuggestions(suggs);
    setShowSuggestions(suggs.length > 0);
    setSelectedIndex(0);
  };

  const insertSuggestion = (s: Suggestion) => {
    const textarea = inputRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart || 0;
    const before = value.slice(0, cursorPos);
    const after = value.slice(cursorPos);

    const matchPos = before.lastIndexOf('{{');
    const newValue = before.slice(0, matchPos) + s.value + after;

    onChange(newValue);
    setShowSuggestions(false);
    textarea.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      if (suggestions[selectedIndex]) {
        insertSuggestion(suggestions[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const inputProps = {
    ref: inputRef as any,
    value,
    onChange: handleInput,
    onKeyDown: handleKeyDown,
    placeholder,
    className: `w-full rounded border border-border bg-surface-container px-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary ${className}`,
  };

  return (
    <div className="relative">
      {type === "textarea" ? (
        <textarea {...inputProps} rows={rows} />
      ) : (
        <input {...inputProps} />
      )}

      {showSuggestions && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-surface-container shadow-xl">
          <div className="max-h-48 overflow-y-auto p-1">
            {suggestions.map((s, i) => (
              <button
                key={s.value}
                onClick={() => insertSuggestion(s)}
                onMouseEnter={() => setSelectedIndex(i)}
                className={`w-full rounded px-2 py-1.5 text-left text-xs transition ${
                  i === selectedIndex ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-surface-container-hover'
                }`}
              >
                <div className="font-medium">{s.label}</div>
                <div className="text-[10px] text-muted-foreground">{s.description}</div>
              </button>
            ))}
          </div>
          <div className="border-t border-border px-2 py-1 text-[9px] text-muted-foreground">
            Press Enter to insert, Esc to close
          </div>
        </div>
      )}
    </div>
  );
}

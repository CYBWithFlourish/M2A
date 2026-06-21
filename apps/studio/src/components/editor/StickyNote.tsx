import { useState } from "react";
import { X } from "lucide-react";

export interface StickyNoteData {
  id: string;
  x: number;
  y: number;
  content: string;
}

export function StickyNote({ note, onUpdate, onDelete }: {
  note: StickyNoteData;
  onUpdate: (content: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(!note.content);

  return (
    <div style={{ left: note.x, top: note.y, width: 220 }}
      className="absolute select-none rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 shadow-lg">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-bold uppercase text-amber-500/70">Note</span>
        <button onClick={onDelete} className="text-muted-foreground hover:text-danger"><X className="h-3 w-3" /></button>
      </div>
      {editing ? (
        <textarea
          autoFocus
          value={note.content}
          onChange={e => onUpdate(e.target.value)}
          onBlur={() => { if (note.content) setEditing(false); }}
          placeholder="Type your note (markdown supported)..."
          className="w-full resize-none rounded border-0 bg-transparent text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none"
          rows={4}
        />
      ) : (
        <div onClick={() => setEditing(true)} className="cursor-text text-[11px] text-foreground whitespace-pre-wrap">
          {note.content || 'Click to edit...'}
        </div>
      )}
    </div>
  );
}

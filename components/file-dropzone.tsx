"use client";

import { useRef, useState } from "react";
import { FileUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  accept: string;
  multiple?: boolean;
  label: string;
  hint: string;
  onFiles: (files: File[]) => void;
}

export function FileDropzone({ accept, multiple, label, hint, onFiles }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function submit(list: FileList | null) {
    if (list?.length) onFiles(Array.from(list));
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        submit(event.dataTransfer.files);
      }}
      className={cn(
        "w-full min-h-44 rounded-xl border-2 border-dashed p-6 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        dragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/60 hover:bg-secondary/40"
      )}
    >
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(event) => { submit(event.target.files); event.target.value = ""; }}
      />
      <FileUp className="mx-auto mb-3 h-8 w-8 text-primary" />
      <span className="block font-medium text-foreground">{label}</span>
      <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
    </button>
  );
}

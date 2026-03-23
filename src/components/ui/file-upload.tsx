import * as React from "react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  value?: string;
  onChange: (file: File | null) => void;
  accept?: string;
  className?: string;
}

export function FileUpload({ value, onChange, accept = "image/*", className }: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string | null>(value ?? null);

  React.useEffect(() => {
    setPreview(value ?? null);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setPreview(URL.createObjectURL(file));
      onChange(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div
        className="relative w-28 h-28 rounded-full border-2 border-dashed border-muted-foreground/40 cursor-pointer overflow-hidden flex items-center justify-center transition-colors hover:border-primary hover:bg-muted/50 bg-muted"
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleChange}
        />
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )}
      </div>
      <div className="flex gap-2 text-xs text-muted-foreground">
        <button type="button" className="hover:text-primary underline" onClick={() => inputRef.current?.click()}>
          {preview ? "Trocar foto" : "Enviar foto"}
        </button>
        {preview && (
          <button type="button" className="hover:text-destructive underline" onClick={handleRemove}>
            Remover
          </button>
        )}
      </div>
    </div>
  );
}

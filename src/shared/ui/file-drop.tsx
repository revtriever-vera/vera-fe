import type { ReactElement } from 'react';
import { useDropzone, type DropzoneState } from 'react-dropzone';
import { cn } from '@/shared/lib/cn';
import { type UiText, useUiText } from './ui-text';

export interface FileDropProps {
    readonly label: string;
    readonly hint: string;
    readonly accept: Readonly<Record<string, readonly string[]>>;
    readonly maxSizeBytes: number;
    readonly fileName: string | null;
    readonly onPicked: (file: File) => void;
    readonly onClear: () => void;
}

export function FileDrop({ label, hint, accept, maxSizeBytes, fileName, onPicked, onClear }: FileDropProps): ReactElement {
    const t: UiText = useUiText();
    const dropzone: DropzoneState = useDropzone({
        accept: accept as Record<string, string[]>,
        maxSize: maxSizeBytes,
        multiple: false,
        onDropAccepted: (files: File[]): void => {
            const file: File | undefined = files[0];
            if (file !== undefined) {
                onPicked(file);
            }
        }
    });

    if (fileName !== null) {
        return (
            <div className="flex items-center justify-between gap-3 rounded-control border border-dashed border-border-strong bg-surface-muted px-3 py-2.5 text-sm">
                <span className="truncate font-mono text-xs font-semibold text-content">{fileName}</span>
                <button type="button" className="text-xs font-semibold text-accent-strong" onClick={onClear}>
                    {t.change}
                </button>
            </div>
        );
    }

    return (
        <div
            {...dropzone.getRootProps()}
            className={cn(
                'flex cursor-pointer flex-col items-center gap-0.5 rounded-control border border-dashed border-border-strong bg-surface-muted px-3 py-4 text-center text-sm text-content-muted transition-colors',
                dropzone.isDragActive && 'border-accent bg-accent/10'
            )}
        >
            <input {...dropzone.getInputProps()} aria-label={label} />
            <span>
                <span className="font-semibold text-content">{t.dropFileHere}</span> {t.orClickToChoose}
            </span>
            <span className="text-2xs text-content-subtle">{hint}</span>
            {dropzone.fileRejections.length > 0 ? <span className="text-2xs text-critical">{t.fileRejected}</span> : null}
        </div>
    );
}

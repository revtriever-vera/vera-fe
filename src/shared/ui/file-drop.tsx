import type { ReactElement } from 'react';
import { useDropzone, type DropzoneState, type FileError, type FileRejection } from 'react-dropzone';
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
    readonly rejectionMessage?: (errorCodes: readonly string[]) => string;
}

function PickedFile({ fileName, onClear }: { readonly fileName: string; readonly onClear: () => void }): ReactElement {
    const t: UiText = useUiText();
    return (
        <div className="flex items-center justify-between gap-3 rounded-control border border-dashed border-border-strong bg-surface-muted px-3 py-2.5 text-sm">
            <span className="truncate font-mono text-xs font-semibold text-content">{fileName}</span>
            <button type="button" className="text-xs font-semibold text-accent-strong" onClick={onClear}>
                {t.change}
            </button>
        </div>
    );
}

function rejectionText(
    fallback: string,
    rejection: FileRejection | undefined,
    message: ((errorCodes: readonly string[]) => string) | undefined
): string | null {
    if (rejection === undefined) {
        return null;
    }
    return message === undefined ? fallback : message(rejection.errors.map((error: FileError): string => error.code));
}

interface DropAreaProps {
    readonly dropzone: DropzoneState;
    readonly label: string;
    readonly hint: string;
    readonly rejection: string | null;
}

function DropArea({ dropzone, label, hint, rejection }: DropAreaProps): ReactElement {
    const t: UiText = useUiText();
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
            {rejection === null ? null : (
                <span role="alert" className="text-2xs text-critical">
                    {rejection}
                </span>
            )}
        </div>
    );
}

export function FileDrop({
    label,
    hint,
    accept,
    maxSizeBytes,
    fileName,
    onPicked,
    onClear,
    rejectionMessage
}: FileDropProps): ReactElement {
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

    const rejection: string | null = rejectionText(t.fileRejected, dropzone.fileRejections[0], rejectionMessage);

    if (fileName !== null) {
        return <PickedFile fileName={fileName} onClear={onClear} />;
    }

    return <DropArea dropzone={dropzone} label={label} hint={hint} rejection={rejection} />;
}

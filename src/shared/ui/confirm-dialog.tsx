import type { ReactElement } from 'react';
import { Button } from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import { type UiText, useUiText } from './ui-text';

interface ConfirmDialogProps {
    readonly title: string;
    readonly description: string;
    readonly confirmLabel: string;
    readonly cancelLabel?: string;
    readonly destructive?: boolean;
    readonly pending?: boolean;
    readonly onConfirm: () => void;
    readonly onCancel: () => void;
}

export function ConfirmDialog({
    title,
    description,
    confirmLabel,
    cancelLabel,
    destructive,
    pending,
    onConfirm,
    onCancel
}: ConfirmDialogProps): ReactElement {
    const t: UiText = useUiText();

    return (
        <Modal
            title={title}
            onClose={onCancel}
            footer={
                <>
                    <Button variant="ghost" onClick={onCancel}>
                        {cancelLabel ?? t.cancel}
                    </Button>
                    <Button variant={destructive === true ? 'danger' : 'primary'} disabled={pending === true} onClick={onConfirm}>
                        {pending === true ? t.pleaseWait : confirmLabel}
                    </Button>
                </>
            }
        >
            <p className="text-sm text-content-muted">{description}</p>
        </Modal>
    );
}

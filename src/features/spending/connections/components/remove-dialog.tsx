import { useState, type ReactElement } from 'react';
import { Button } from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';

export interface RemoveDialogProps {
    readonly title: string;
    readonly description: string;
    readonly purgeLabel: string;
    readonly confirmLabel: string;
    readonly confirmPurgeLabel: string;
    readonly cancelLabel: string;
    readonly pending: boolean;
    readonly onConfirm: (purgeTransactions: boolean) => void;
    readonly onCancel: () => void;
}

function PurgeCheckbox({
    checked,
    label,
    onChange
}: {
    readonly checked: boolean;
    readonly label: string;
    readonly onChange: (checked: boolean) => void;
}): ReactElement {
    return (
        <label className="flex items-start gap-2 text-content">
            <input
                type="checkbox"
                className="mt-0.5 size-4 accent-accent"
                checked={checked}
                onChange={(event): void => {
                    onChange(event.target.checked);
                }}
            />
            {label}
        </label>
    );
}

export function RemoveDialog(props: RemoveDialogProps): ReactElement {
    const [purge, setPurge] = useState<boolean>(false);
    return (
        <Modal
            title={props.title}
            onClose={props.onCancel}
            footer={
                <>
                    <Button variant="ghost" onClick={props.onCancel}>
                        {props.cancelLabel}
                    </Button>
                    <Button
                        variant="danger"
                        loading={props.pending}
                        onClick={(): void => {
                            props.onConfirm(purge);
                        }}
                    >
                        {purge ? props.confirmPurgeLabel : props.confirmLabel}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-4 text-sm">
                <p className="text-content-muted">{props.description}</p>
                <PurgeCheckbox checked={purge} label={props.purgeLabel} onChange={setPurge} />
            </div>
        </Modal>
    );
}

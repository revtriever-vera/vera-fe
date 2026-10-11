import { useId, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';

export interface AlwaysCheckboxProps {
    readonly checked: boolean;
    readonly target: string;
    readonly onChange: (checked: boolean) => void;
}

export function AlwaysCheckbox({ checked, target, onChange }: AlwaysCheckboxProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingTransactions', undefined> = useTranslation('spendingTransactions');
    const id: string = useId();
    return (
        <label htmlFor={id} className="flex min-w-0 items-center gap-2 text-sm text-content">
            <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={(event): void => {
                    onChange(event.target.checked);
                }}
                className="size-4 shrink-0 accent-accent"
            />
            <span className="min-w-0 break-words">{t('inline.always', { target })}</span>
        </label>
    );
}

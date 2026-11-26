import { useId, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';

export interface ActionAlwaysProps {
    readonly checked: boolean;
    readonly disabled: boolean;
    readonly onChange: (checked: boolean) => void;
}

export function ActionAlways({ checked, disabled, onChange }: ActionAlwaysProps): ReactElement {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    const id: string = useId();
    return (
        <label htmlFor={id} className="flex min-w-0 items-center gap-2 text-sm text-content">
            <input
                id={id}
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={(event): void => {
                    onChange(event.target.checked);
                }}
                className="size-4 shrink-0 accent-accent"
            />
            <span className="min-w-0 break-words">{t('action.always')}</span>
        </label>
    );
}

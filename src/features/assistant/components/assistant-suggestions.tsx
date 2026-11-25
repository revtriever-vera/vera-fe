import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { screenOf, suggestionKeys, type SuggestionKey } from '../lib/assistant-screens';

export interface AssistantSuggestionsProps {
    readonly path: string;
    readonly disabled: boolean;
    readonly onPick: (text: string) => void;
}

export function AssistantSuggestions({ path, disabled, onPick }: AssistantSuggestionsProps): ReactElement {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    return (
        <div className="flex flex-col gap-3 p-1">
            <div className="flex flex-col gap-1">
                <h3 className="m-0 text-base font-semibold text-content">{t('empty.title')}</h3>
                <p className="m-0 text-sm text-content-muted">{t('empty.hint')}</p>
            </div>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {suggestionKeys(screenOf(path)).map((key: SuggestionKey): ReactElement => {
                    const text: string = t(key);
                    return (
                        <li key={key}>
                            <button
                                type="button"
                                disabled={disabled}
                                onClick={(): void => {
                                    onPick(text);
                                }}
                                className="w-full rounded-control border border-border bg-surface px-3 py-2 text-left text-sm text-content transition-colors hover:bg-surface-muted disabled:opacity-50"
                            >
                                {text}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

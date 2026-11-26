import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import { formatIsoDate } from '@/shared/lib/format/date';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Money } from '@/shared/ui/money';
import type { ActionCandidate } from '../types';

export interface ActionCandidatesProps {
    readonly candidates: readonly ActionCandidate[];
    readonly picked: string | null;
    readonly disabled: boolean;
    readonly onPick: (id: string) => void;
}

function Candidate({
    candidate,
    checked,
    disabled,
    onPick
}: {
    readonly candidate: ActionCandidate;
    readonly checked: boolean;
    readonly disabled: boolean;
    readonly onPick: (id: string) => void;
}): ReactElement {
    const locale: SupportedLocale = useLocale();
    return (
        <li>
            <label className="flex cursor-pointer items-start gap-2 rounded-control border border-border bg-surface px-2 py-1.5 has-[:checked]:border-accent-strong">
                <input
                    type="radio"
                    name="action-candidate"
                    className="mt-1"
                    checked={checked}
                    disabled={disabled}
                    onChange={(): void => {
                        onPick(candidate.id);
                    }}
                />
                <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-medium">{candidate.description}</span>
                    <span className="text-xs text-content-muted">
                        {formatIsoDate(candidate.date, locale)} · {candidate.accountName}
                    </span>
                </span>
                <Money amountMinor={candidate.amountMinor} currency={candidate.currency} className="shrink-0 text-xs" />
            </label>
        </li>
    );
}

export function ActionCandidates({ candidates, picked, disabled, onPick }: ActionCandidatesProps): ReactElement {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    return (
        <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className="mb-1 p-0 text-xs font-semibold text-content-muted">{t('action.pick')}</legend>
            <ul className="m-0 flex list-none flex-col gap-1 p-0">
                {candidates.map((candidate: ActionCandidate): ReactElement => (
                    <Candidate
                        key={candidate.id}
                        candidate={candidate}
                        checked={picked === candidate.id}
                        disabled={disabled}
                        onPick={onPick}
                    />
                ))}
            </ul>
        </fieldset>
    );
}

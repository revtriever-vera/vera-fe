import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { FormProblem } from '../lib/use-recategorize-form';

export interface FormProblemNoteProps {
    readonly problem: FormProblem;
    readonly incoming: boolean;
}

export function FormProblemNote({ problem, incoming }: FormProblemNoteProps): ReactElement | null {
    const { t }: UseTranslationResponse<'spendingTransactions', undefined> = useTranslation('spendingTransactions');
    if (problem === null) {
        return null;
    }
    if (problem === 'invalidRule') {
        return (
            <p role="alert" className="text-xs text-caution">
                {t('inline.invalidRule')}
            </p>
        );
    }
    return (
        <p role="alert" className="text-xs text-critical">
            {incoming ? t('inline.kindMismatchIn') : t('inline.kindMismatchOut')}
        </p>
    );
}

import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { CategoryPicker } from '../../components/category-picker';
import type { TransactionView } from '../../types';
import { useRecategorizeForm, type RecategorizeForm } from '../lib/use-recategorize-form';
import { transactionTitle } from '../lib/transaction-label';
import { AlwaysCheckbox } from './always-checkbox';
import { FormProblemNote } from './form-problem-note';

export interface InlineCategorizeProps {
    readonly transaction: TransactionView;
}

const NOOP: () => void = (): void => undefined;

export function InlineCategorize({ transaction }: InlineCategorizeProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingTransactions', undefined> = useTranslation('spendingTransactions');
    const incoming: boolean = transaction.amountMinor > 0;
    const form: RecategorizeForm = useRecategorizeForm({ transaction, initialAlways: true, onDone: NOOP });
    return (
        <form
            className="flex min-w-0 flex-col gap-2"
            onSubmit={(event): void => {
                event.preventDefault();
                form.submit();
            }}
        >
            <CategoryPicker
                value={form.categoryId}
                onChange={form.pick}
                direction={incoming ? 'in' : 'out'}
                emptyLabel={t('inline.pick')}
                label={t('inline.pickLabel', { description: transactionTitle(transaction) })}
            />
            <FormProblemNote problem={form.problem} incoming={incoming} />
            <AlwaysCheckbox checked={form.always} target={form.target.label} onChange={form.setAlways} />
            <Button type="submit" size="sm" className="self-start" loading={form.pending} disabled={form.categoryId === null}>
                {t('inline.apply')}
            </Button>
        </form>
    );
}

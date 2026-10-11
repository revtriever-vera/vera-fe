import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import { CategoryPicker } from '../../components/category-picker';
import type { TransactionView } from '../../types';
import { transactionTitle } from '../lib/transaction-label';
import { useRecategorizeForm, type RecategorizeForm } from '../lib/use-recategorize-form';
import { AlwaysCheckbox } from './always-checkbox';
import { FormProblemNote } from './form-problem-note';

export interface RecategorizeDialogProps {
    readonly transaction: TransactionView;
    readonly onClose: () => void;
}

export function RecategorizeDialog({ transaction, onClose }: RecategorizeDialogProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingTransactions', undefined> = useTranslation('spendingTransactions');
    const incoming: boolean = transaction.amountMinor > 0;
    const form: RecategorizeForm = useRecategorizeForm({ transaction, initialAlways: false, onDone: onClose });
    const changed: boolean = form.categoryId !== null && form.categoryId !== transaction.categoryId;
    return (
        <Modal
            title={t('dialog.title')}
            description={transactionTitle(transaction)}
            onClose={onClose}
            footer={
                <>
                    {transaction.categorySource === 'user' ? (
                        <Button variant="ghost" className="mr-auto" disabled={form.pending} onClick={form.revert}>
                            {t('dialog.revert')}
                        </Button>
                    ) : null}
                    <Button variant="secondary" onClick={onClose}>
                        {t('dialog.cancel')}
                    </Button>
                    <Button loading={form.pending} disabled={!changed} onClick={form.submit}>
                        {t('dialog.save')}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-3">
                <CategoryPicker
                    value={form.categoryId ?? transaction.categoryId}
                    onChange={form.pick}
                    direction={incoming ? 'in' : 'out'}
                    label={t('dialog.pickLabel')}
                />
                <FormProblemNote problem={form.problem} incoming={incoming} />
                <AlwaysCheckbox checked={form.always} target={form.target.label} onChange={form.setAlways} />
            </div>
        </Modal>
    );
}

import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { Plug, Repeat } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useRole } from '@/app/providers/use-role';
import { buttonVariants } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';

const BANKS_TAB: { readonly tab: string } = { tab: 'banks' };

export function RecurringNoTransactions(): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const { canEdit } = useRole();
    const icon: ReactElement = <Plug className="size-6" />;
    if (!canEdit) {
        return <EmptyState icon={icon} title={t('empty.noTransactionsTitle')} description={t('empty.viewerDescription')} />;
    }
    return (
        <EmptyState
            icon={icon}
            title={t('empty.noTransactionsTitle')}
            description={t('empty.noTransactionsDescription')}
            actions={
                <>
                    <Link to="/settings/$tab" params={BANKS_TAB} className={buttonVariants({ size: 'lg' })}>
                        {t('empty.connect')}
                    </Link>
                    <Link
                        to="/settings/$tab"
                        params={BANKS_TAB}
                        search={{ import: true }}
                        className={buttonVariants({ variant: 'secondary', size: 'lg' })}
                    >
                        {t('empty.import')}
                    </Link>
                </>
            }
        />
    );
}

export function RecurringNoSeries(): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const { canEdit } = useRole();
    return (
        <EmptyState
            icon={<Repeat className="size-6" />}
            title={t('empty.noSeriesTitle')}
            description={t('empty.noSeriesDescription')}
            actions={
                canEdit ? (
                    <Link to="/spending/transactions" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
                        {t('empty.markTransaction')}
                    </Link>
                ) : undefined
            }
        />
    );
}

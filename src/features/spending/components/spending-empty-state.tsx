import type { ReactElement } from 'react';
import { useRole } from '@/app/providers/use-role';
import { Plug } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { buttonVariants } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { SampleDataButton } from '@/shared/ui/sample-data-button';

const BANKS_TAB: { readonly tab: string } = { tab: 'banks' };

export function SpendingEmptyState(): ReactElement {
    const { t }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const { canEdit } = useRole();
    if (!canEdit) {
        return (
            <EmptyState title={t('emptyState.title')} description={t('emptyState.viewerDescription')} icon={<Plug className="size-6" />} />
        );
    }
    return (
        <EmptyState
            title={t('emptyState.title')}
            description={t('emptyState.description')}
            icon={<Plug className="size-6" />}
            actions={
                <>
                    <Link to="/settings/$tab" params={BANKS_TAB} className={buttonVariants({ size: 'lg' })}>
                        <Plug className="size-4" aria-hidden="true" />
                        {t('emptyState.connect')}
                    </Link>
                    <Link
                        to="/settings/$tab"
                        params={BANKS_TAB}
                        search={{ import: true }}
                        className={buttonVariants({ variant: 'secondary', size: 'lg' })}
                    >
                        {t('emptyState.import')}
                    </Link>
                    <SampleDataButton />
                </>
            }
        />
    );
}

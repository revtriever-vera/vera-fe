import type { ReactElement } from 'react';
import { Plug } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { buttonVariants } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { SampleDataButton } from '@/shared/ui/sample-data-button';

export function SpendingEmptyState(): ReactElement {
    const { t }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    return (
        <EmptyState
            title={t('emptyState.title')}
            description={t('emptyState.description')}
            icon={<Plug className="size-6" />}
            actions={
                <>
                    <Link to="/gastos/conexoes" className={buttonVariants({ size: 'lg' })}>
                        <Plug className="size-4" aria-hidden="true" />
                        {t('emptyState.connect')}
                    </Link>
                    <Link
                        to="/gastos/conexoes"
                        search={{ importar: true }}
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

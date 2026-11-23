import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { FailureAlert } from '@/shared/ui/failure-alert';
import { Loading, SkeletonText } from '@/shared/ui/skeleton';
import { useConcentration } from '../api/use-concentration.query';
import { IssuerCard } from './issuer-card';
import { SectorCard } from './sector-card';

function ConcentrationLoading(): ReactElement {
    const { t }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    return (
        <Loading label={t('concentration.loading')} className="grid gap-4 min-[861px]:grid-cols-2">
            <SkeletonText lines={6} className="surface-card p-5" />
            <SkeletonText lines={6} className="surface-card p-5" />
        </Loading>
    );
}

export function ConcentrationTab(): ReactElement {
    const { t }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    const query: ReturnType<typeof useConcentration> = useConcentration();
    if (query.error !== null) {
        return (
            <div className="flex flex-col items-start gap-3">
                <FailureAlert error={query.error} title={t('concentration.loadError')} />
                <Button
                    variant="secondary"
                    onClick={(): void => {
                        void query.refetch();
                    }}
                >
                    {t('concentration.retry')}
                </Button>
            </div>
        );
    }
    if (query.data === undefined) {
        return <ConcentrationLoading />;
    }
    return (
        <div className="grid items-start gap-4 min-[861px]:grid-cols-2">
            <IssuerCard data={query.data} />
            <SectorCard data={query.data} />
        </div>
    );
}

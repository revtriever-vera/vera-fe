import type { ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { useUncategorizedCount } from '../../api/use-uncategorized-count.query';
import type { UncategorizedCount } from '../../types';

export interface UncategorizedBannerProps {
    readonly onShowUncategorized: () => void;
}

export function UncategorizedBanner({ onShowUncategorized }: UncategorizedBannerProps): ReactElement | null {
    const { t }: UseTranslationResponse<'spendingTransactions', undefined> = useTranslation('spendingTransactions');
    const count: UseQueryResult<UncategorizedCount> = useUncategorizedCount();
    if (count.data === undefined) {
        return null;
    }
    if (count.data.count === 0) {
        return <Alert tone="positive" title={t('banner.allDoneTitle')} detail={t('banner.allDoneDetail')} />;
    }
    return (
        <Alert
            tone="caution"
            title={t('banner.uncategorizedTitle', { count: count.data.count })}
            detail={t('banner.uncategorizedDetail')}
            action={
                <Button variant="secondary" size="sm" onClick={onShowUncategorized}>
                    {t('banner.show')}
                </Button>
            }
        />
    );
}

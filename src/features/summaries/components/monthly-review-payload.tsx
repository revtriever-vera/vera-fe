import type { ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Loading, SkeletonText } from '@/shared/ui/skeleton';
import { useAiPayload } from '../api/use-ai-payload.query';
import type { PayloadView } from '../types';
import { PayloadFrame, PayloadJson } from './payload-modal';

export interface MonthlyReviewPayloadProps {
    readonly month: string;
    readonly onClose: () => void;
}

function PayloadContent({ month }: { readonly month: string }): ReactElement {
    const { t }: UseTranslationResponse<'summaries', undefined> = useTranslation('summaries');
    const query: UseQueryResult<PayloadView | null> = useAiPayload('monthly_review', { month });
    if (query.error !== null) {
        return <p className="m-0 text-sm text-critical">{t('payload.failed')}</p>;
    }
    if (query.data === undefined) {
        return (
            <Loading label={t('payload.loading')}>
                <SkeletonText lines={6} />
            </Loading>
        );
    }
    return query.data === null ? (
        <p className="m-0 text-sm text-content-muted">{t('payload.empty')}</p>
    ) : (
        <PayloadJson payload={query.data} />
    );
}

export function MonthlyReviewPayload({ month, onClose }: MonthlyReviewPayloadProps): ReactElement {
    return (
        <PayloadFrame onClose={onClose}>
            <PayloadContent month={month} />
        </PayloadFrame>
    );
}

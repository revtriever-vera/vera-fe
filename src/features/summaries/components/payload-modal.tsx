import { useEffect, type ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { track } from '@/shared/lib/analytics';
import { Button } from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import { Loading, SkeletonText } from '@/shared/ui/skeleton';
import { useAiPayload } from '../api/use-ai-payload.query';
import type { PayloadView, SummaryKind, SummaryParams } from '../types';

export interface PayloadFrameProps {
    readonly onClose: () => void;
    readonly children: ReactElement;
}

export function PayloadFrame({ onClose, children }: PayloadFrameProps): ReactElement {
    const { t }: UseTranslationResponse<'summaries', undefined> = useTranslation('summaries');
    return (
        <Modal
            title={t('payload.title')}
            description={t('payload.description')}
            onClose={onClose}
            size="wide"
            fullOnMobile
            footer={<Button onClick={onClose}>{t('payload.close')}</Button>}
        >
            {children}
        </Modal>
    );
}

export function PayloadJson({ payload }: { readonly payload: PayloadView }): ReactElement {
    return (
        <pre className="max-h-[60vh] overflow-auto rounded-control border border-border bg-surface-muted p-3 font-mono text-xs leading-relaxed text-content">
            {JSON.stringify(payload.payload, null, 2)}
        </pre>
    );
}

function useTrackPayloadViewed(kind: SummaryKind, shown: boolean): void {
    useEffect((): void => {
        if (shown) {
            track('summary_payload_viewed', { kind });
        }
    }, [kind, shown]);
}

export interface PayloadBodyProps {
    readonly kind: SummaryKind;
    readonly params: SummaryParams;
}

export function PayloadBody({ kind, params }: PayloadBodyProps): ReactElement {
    const { t }: UseTranslationResponse<'summaries', undefined> = useTranslation('summaries');
    const query: UseQueryResult<PayloadView | null> = useAiPayload(kind, params);
    useTrackPayloadViewed(kind, query.data !== undefined && query.data !== null);
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

export interface PayloadModalProps extends PayloadBodyProps {
    readonly onClose: () => void;
}

export function PayloadModal({ kind, params, onClose }: PayloadModalProps): ReactElement {
    return (
        <PayloadFrame onClose={onClose}>
            <PayloadBody kind={kind} params={params} />
        </PayloadFrame>
    );
}

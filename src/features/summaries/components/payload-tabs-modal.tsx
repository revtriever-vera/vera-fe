import { useState, type ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { SegmentedControl, type SegmentedOption } from '@/shared/ui/segmented-control';
import { useAiPayload } from '../api/use-ai-payload.query';
import { SUMMARY_KIND, SUMMARY_KINDS, type PayloadView, type SummaryKind, type SummaryParams } from '../types';
import { PayloadBody, PayloadFrame } from './payload-modal';

const TAB_KEYS: Readonly<Record<SummaryKind, 'payload.tabMonth' | 'payload.tabCuts' | 'payload.tabPortfolio'>> = {
    month: 'payload.tabMonth',
    cuts: 'payload.tabCuts',
    portfolio: 'payload.tabPortfolio'
};

export interface PayloadTabsModalProps {
    readonly portfolioParams: SummaryParams;
    readonly onClose: () => void;
}

function useAvailableKinds(portfolioParams: SummaryParams): readonly SummaryKind[] {
    const month: UseQueryResult<PayloadView | null> = useAiPayload(SUMMARY_KIND.month, {});
    const cuts: UseQueryResult<PayloadView | null> = useAiPayload(SUMMARY_KIND.cuts, {});
    const portfolio: UseQueryResult<PayloadView | null> = useAiPayload(SUMMARY_KIND.portfolio, portfolioParams);
    const results: Readonly<Record<SummaryKind, UseQueryResult<PayloadView | null>>> = { month, cuts, portfolio };
    return SUMMARY_KINDS.filter((kind: SummaryKind): boolean => results[kind].data !== undefined && results[kind].data !== null);
}

function paramsOf(kind: SummaryKind, portfolioParams: SummaryParams): SummaryParams {
    return kind === SUMMARY_KIND.portfolio ? portfolioParams : {};
}

export function PayloadTabsModal({ portfolioParams, onClose }: PayloadTabsModalProps): ReactElement {
    const { t }: UseTranslationResponse<'summaries', undefined> = useTranslation('summaries');
    const kinds: readonly SummaryKind[] = useAvailableKinds(portfolioParams);
    const [picked, setPicked] = useState<SummaryKind | null>(null);
    const active: SummaryKind = picked !== null && kinds.includes(picked) ? picked : (kinds[0] ?? SUMMARY_KIND.month);
    const options: readonly SegmentedOption<SummaryKind>[] = kinds.map((kind: SummaryKind): SegmentedOption<SummaryKind> => ({
        value: kind,
        label: t(TAB_KEYS[kind])
    }));
    return (
        <PayloadFrame onClose={onClose}>
            <div className="flex flex-col gap-3">
                {options.length > 1 ? (
                    <SegmentedControl label={t('payload.tabsLabel')} options={options} value={active} onChange={setPicked} />
                ) : null}
                <PayloadBody kind={active} params={paramsOf(active, portfolioParams)} />
            </div>
        </PayloadFrame>
    );
}

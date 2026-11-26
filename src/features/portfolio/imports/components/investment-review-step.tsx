import type { ReactElement } from 'react';
import type { TFunction } from 'i18next';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { InvestmentImportFlow } from '../lib/use-investment-import-flow';
import { EffectList } from './effect-list';
import { FixedIncomeSection } from './fixed-income-section';
import { OperationsTable } from './operations-table';

export type ReviewFlow = Pick<
    InvestmentImportFlow,
    | 'lines'
    | 'drafts'
    | 'editLine'
    | 'titles'
    | 'choices'
    | 'holder'
    | 'chooseTitle'
    | 'rows'
    | 'modes'
    | 'chooseMode'
    | 'readiness'
    | 'pendingTitles'
    | 'canConfirm'
>;

export function blockerText(flow: ReviewFlow, t: TFunction<'portfolioImports'>): string | null {
    const { readiness } = flow;
    if (readiness.blocked > 0) {
        return t('blockers.blocked', { count: readiness.blocked });
    }
    if (readiness.invalid > 0) {
        return t('blockers.invalid');
    }
    if (readiness.pendingAssets.length > 0) {
        return t('blockers.assets', { count: readiness.pendingAssets.length });
    }
    if (flow.pendingTitles > 0) {
        return t('fixedIncome.pending', { count: flow.pendingTitles });
    }
    return flow.canConfirm ? null : t('blockers.nothing');
}

export function InvestmentReviewStep({ flow }: { readonly flow: ReviewFlow }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    const blocker: string | null = blockerText(flow, t);
    return (
        <div className="flex flex-col gap-5">
            <OperationsTable lines={flow.lines} drafts={flow.drafts} onEdit={flow.editLine} />
            <FixedIncomeSection titles={flow.titles} choices={flow.choices} holder={flow.holder} onChoose={flow.chooseTitle} />
            <EffectList rows={flow.rows} modes={flow.modes} onMode={flow.chooseMode} />
            {blocker === null ? null : <output className="text-sm text-content-muted">{blocker}</output>}
        </div>
    );
}

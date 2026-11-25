import type { ReactElement } from 'react';
import type { TFunction } from 'i18next';
import { CircleCheck } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { ImportOutcome } from '../lib/use-investment-import-flow';
import { EffectList } from './effect-list';
import type { EffectRow } from '../lib/recalculate-effect';
import type { EffectItem } from '../types';

const DEFAULT_CURRENCY: string = 'BRL';

function toRows(positions: readonly EffectItem[], currencies: ImportOutcome['currencies']): EffectRow[] {
    return positions.map((item: EffectItem): EffectRow => ({
        ...item,
        currency: currencies[item.assetId] ?? DEFAULT_CURRENCY,
        recalculated: false
    }));
}

function summaryOf(
    t: TFunction<'portfolioImports'>,
    applied: number,
    titles: number,
    params: { operations: string; assets: string; titles: string }
): string {
    if (applied === 0) {
        return t('result.summaryOnlyTitles', params);
    }
    return titles > 0 ? t('result.summaryTitles', params) : t('result.summary', params);
}

export function InvestmentImportResult({ outcome }: { readonly outcome: ImportOutcome }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    const { created, titles } = outcome;
    const params: { operations: string; assets: string; titles: string } = {
        operations: t('result.operations', { count: created.applied }),
        assets: t('result.assets', { count: created.positions.length }),
        titles: t('result.titles', { count: titles })
    };
    return (
        <output className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-positive">
                <CircleCheck className="size-5" aria-hidden="true" />
                <h3 className="text-base font-semibold">{t('result.title')}</h3>
            </div>
            <p className="text-sm font-semibold text-content">{summaryOf(t, created.applied, titles, params)}</p>
            {created.skipped > 0 ? <p className="text-sm text-content-muted">{t('result.skipped', { count: created.skipped })}</p> : null}
            <EffectList rows={toRows(created.positions, outcome.currencies)} />
        </output>
    );
}

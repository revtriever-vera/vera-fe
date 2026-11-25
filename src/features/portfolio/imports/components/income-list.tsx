import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import { formatIsoDate } from '@/shared/lib/format/date';
import { Money } from '@/shared/ui/money';
import type { SupportedLocale } from '@/shared/lib/locale';
import type { PreviewLine } from '../types';
import { ForeignAmounts, WithholdingAmounts } from './foreign-amounts';

const DEFAULT_CURRENCY: string = 'BRL';

function IncomeItem({ line }: { readonly line: PreviewLine }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    const locale: SupportedLocale = useLocale();
    return (
        <li className="flex flex-col gap-2 py-2 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="min-w-0">
                    <b>{line.ticker ?? t('table.unnamedAsset')}</b> ·{' '}
                    {line.incomeKind === null ? t('kinds.income') : t(`incomeKinds.${line.incomeKind}`)}
                    {line.tradeDate === null ? null : (
                        <span className="text-content-muted"> · {formatIsoDate(line.tradeDate, locale)}</span>
                    )}
                </span>
                {line.grossMinor === null ? null : <Money amountMinor={line.grossMinor} currency={line.currency ?? DEFAULT_CURRENCY} />}
            </div>
            <WithholdingAmounts line={line} />
            <ForeignAmounts line={line} />
        </li>
    );
}

export function IncomeList({ lines }: { readonly lines: readonly PreviewLine[] }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    return (
        <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold text-content">{t('income.title')}</h3>
            <p className="text-sm text-content-muted">{t('income.description')}</p>
            <ul aria-label={t('income.label')} className="flex flex-col divide-y divide-border">
                {lines.map((line: PreviewLine): ReactElement => (
                    <IncomeItem key={line.lineId} line={line} />
                ))}
            </ul>
        </div>
    );
}

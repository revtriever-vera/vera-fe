import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Money } from '@/shared/ui/money';
import type { PreviewLine } from '../types';

const HOME_CURRENCY: string = 'BRL';
const FX_DIGITS: number = 4;

interface AmountProps {
    readonly label: string;
    readonly children: ReactElement | string;
}

function Amount({ label, children }: AmountProps): ReactElement {
    return (
        <div className="flex flex-col">
            <dt className="text-xs text-content-muted">{label}</dt>
            <dd className="text-sm text-content">{children}</dd>
        </div>
    );
}

function formatFxRate(rate: string, locale: SupportedLocale): string {
    return new Intl.NumberFormat(locale, { minimumFractionDigits: FX_DIGITS, maximumFractionDigits: FX_DIGITS }).format(Number(rate));
}

function isForeign(line: PreviewLine): boolean {
    return line.currency !== null && line.currency !== HOME_CURRENCY && line.grossMinor !== null;
}

export function ForeignAmounts({ line }: { readonly line: PreviewLine }): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    const locale: SupportedLocale = useLocale();
    if (!isForeign(line) || line.currency === null || line.grossMinor === null) {
        return null;
    }
    return (
        <dl aria-label={t('foreign.label')} className="flex flex-wrap gap-x-6 gap-y-2 rounded-control bg-surface-muted px-3 py-2">
            <Amount label={t('foreign.original', { currency: line.currency })}>
                <Money amountMinor={line.grossMinor} currency={line.currency} />
            </Amount>
            {line.fxRate === null || line.fxRate === undefined ? null : (
                <Amount label={t('foreign.ptax')}>{formatFxRate(line.fxRate, locale)}</Amount>
            )}
            {line.grossBrlMinor === null || line.grossBrlMinor === undefined ? null : (
                <Amount label={t('foreign.converted')}>
                    <Money amountMinor={line.grossBrlMinor} currency={HOME_CURRENCY} />
                </Amount>
            )}
        </dl>
    );
}

export function WithholdingAmounts({ line }: { readonly line: PreviewLine }): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    const withheld: number | null | undefined = line.withheldTaxMinor;
    if (withheld === null || withheld === undefined || withheld <= 0 || line.grossMinor === null) {
        return null;
    }
    const currency: string = line.currency ?? HOME_CURRENCY;
    return (
        <dl aria-label={t('withholding.label')} className="flex flex-wrap gap-x-6 gap-y-2">
            <Amount label={t('withholding.gross')}>
                <Money amountMinor={line.grossMinor} currency={currency} />
            </Amount>
            <Amount label={t('withholding.tax')}>
                <Money amountMinor={withheld} currency={currency} />
            </Amount>
            <Amount label={t('withholding.net')}>
                <Money amountMinor={line.grossMinor - withheld} currency={currency} />
            </Amount>
        </dl>
    );
}

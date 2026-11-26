import type { TFunction } from 'i18next';
import type { SupportedLocale } from '@/shared/lib/locale';
import { formatUnitPrice } from '../../assets/lib/format-unit-price';
import type { PositionBalance } from '../types';
import type { EffectRow } from './recalculate-effect';

const QUANTITY_DIGITS: number = 8;

export function formatBalanceQuantity(quantity: string, locale: SupportedLocale): string {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: QUANTITY_DIGITS }).format(Number(quantity));
}

function averageOf(balance: PositionBalance | null, currency: string, locale: SupportedLocale): string | null {
    const price: string | null | undefined = balance?.averagePrice;
    return price === null || price === undefined ? null : formatUnitPrice(price, currency, locale);
}

export function quantityLine(t: TFunction<'portfolioImports'>, row: EffectRow, locale: SupportedLocale): string {
    const ticker: string = row.ticker;
    if (row.after === null) {
        const from: string = row.before === null ? '0' : formatBalanceQuantity(row.before.quantity, locale);
        return t('effect.closed', { ticker, from });
    }
    const to: string = formatBalanceQuantity(row.after.quantity, locale);
    if (row.before === null) {
        return t('effect.created', { ticker, to });
    }
    const from: string = formatBalanceQuantity(row.before.quantity, locale);
    return from === to ? t('effect.unchanged', { ticker, to }) : t('effect.changed', { ticker, from, to });
}

export function averageLine(t: TFunction<'portfolioImports'>, row: EffectRow, locale: SupportedLocale): string | null {
    if (row.after === null) {
        return null;
    }
    const to: string | null = averageOf(row.after, row.currency, locale);
    if (to === null) {
        return t('effect.averageUnknown');
    }
    const from: string | null = averageOf(row.before, row.currency, locale);
    return from === null ? t('effect.averageNew', { to }) : t('effect.average', { from, to });
}

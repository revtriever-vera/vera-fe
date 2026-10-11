import type { TFunction } from 'i18next';
import type { z } from 'zod';
import type { SupportedLocale } from '@/shared/lib/locale';
import { createQuantitySchema } from '../schemas/position.schema';

export type QuantityDraft = { readonly ok: true; readonly value: string } | { readonly ok: false; readonly message: string };

function decimalSeparator(locale: SupportedLocale): string {
    return (
        new Intl.NumberFormat(locale).formatToParts(1.1).find((part: Intl.NumberFormatPart): boolean => part.type === 'decimal')?.value ??
        '.'
    );
}

export function displayQuantity(quantity: string, locale: SupportedLocale): string {
    return quantity.replace('.', decimalSeparator(locale));
}

export function isZeroQuantity(quantity: string | null): boolean {
    return quantity !== null && Number(quantity) === 0;
}

export function parseQuantityDraft(t: TFunction<'portfolioAssets'>, draft: string, allowedDecimals: number): QuantityDraft {
    const result: ReturnType<z.ZodType<string>['safeParse']> = createQuantitySchema(t, allowedDecimals).safeParse(draft);
    if (result.success) {
        return { ok: true, value: result.data };
    }
    return { ok: false, message: result.error.issues[0]?.message ?? t('position.errors.quantityInvalid') };
}

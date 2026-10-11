import type { TFunction } from 'i18next';
import { z } from 'zod';
import { decimalPlaces, fitsDecimals, isDecimalText, normalizeDecimalInput } from '../lib/quantity-decimals';

const MAX_INTEGER_DIGITS: number = 18;
const MAX_PRICE_INTEGER_DIGITS: number = 16;
const MAX_PRICE_DECIMALS: number = 8;

export interface PositionFormInput {
    quantity: string;
    averagePrice: string;
    classId: string;
}

export interface QuantityFormInput {
    quantity: string;
}

function integerDigits(text: string): number {
    const separator: number = text.indexOf('.');
    return separator === -1 ? text.length : separator;
}

function isPriceText(text: string): boolean {
    return isDecimalText(text) && integerDigits(text) <= MAX_PRICE_INTEGER_DIGITS && decimalPlaces(text) <= MAX_PRICE_DECIMALS;
}

function decimalsMessage(t: TFunction<'portfolioAssets'>, allowedDecimals: number): string {
    return allowedDecimals === 0 ? t('position.errors.quantityInteger') : t('position.errors.quantityDecimals', { count: allowedDecimals });
}

export function createQuantitySchema(t: TFunction<'portfolioAssets'>, allowedDecimals: number): z.ZodType<string> {
    return z
        .string()
        .trim()
        .min(1, t('position.errors.quantityRequired'))
        .transform(normalizeDecimalInput)
        .refine((value: string): boolean => isDecimalText(value) && integerDigits(value) <= MAX_INTEGER_DIGITS, {
            message: t('position.errors.quantityInvalid')
        })
        .refine((value: string): boolean => !isDecimalText(value) || fitsDecimals(value, allowedDecimals), {
            message: decimalsMessage(t, allowedDecimals)
        });
}

export function createQuantityFormSchema(t: TFunction<'portfolioAssets'>, allowedDecimals: number): z.ZodType<QuantityFormInput> {
    return z.object({ quantity: createQuantitySchema(t, allowedDecimals) });
}

export function createPositionSchema(t: TFunction<'portfolioAssets'>, allowedDecimals: number): z.ZodType<PositionFormInput> {
    return z.object({
        quantity: createQuantitySchema(t, allowedDecimals),
        averagePrice: z
            .string()
            .trim()
            .refine((value: string): boolean => value === '' || isPriceText(normalizeDecimalInput(value)), {
                message: t('position.errors.priceInvalid')
            }),
        classId: z.string().min(1, t('position.errors.classRequired'))
    });
}

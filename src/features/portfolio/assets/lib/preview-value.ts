export interface PreviewValueArgs {
    readonly quantity: string;
    readonly price: string;
    readonly priceCurrency: string;
    readonly baseCurrency: string;
    readonly brlPerUsd: string | null;
}

const MINOR_FACTOR: number = 100;

function toNonNegative(text: string): number | null {
    const value: number = Number(text);
    return text.trim() !== '' && Number.isFinite(value) && value >= 0 ? value : null;
}

export function needsExchangeRate(priceCurrency: string, baseCurrency: string): boolean {
    return priceCurrency !== baseCurrency;
}

export function previewValueMinor({ quantity, price, priceCurrency, baseCurrency, brlPerUsd }: PreviewValueArgs): number | null {
    const amount: number | null = toNonNegative(quantity);
    const unit: number | null = toNonNegative(price);
    if (amount === null || unit === null) {
        return null;
    }
    const native: number = amount * unit;
    if (!needsExchangeRate(priceCurrency, baseCurrency)) {
        return Math.round(native * MINOR_FACTOR);
    }
    const rate: number | null = brlPerUsd === null ? null : toNonNegative(brlPerUsd);
    if (rate === null || rate === 0) {
        return null;
    }
    const converted: number = baseCurrency === 'BRL' ? native * rate : native / rate;
    return Math.round(converted * MINOR_FACTOR);
}

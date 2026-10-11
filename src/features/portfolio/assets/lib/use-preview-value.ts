import { useExchangeRate } from '../api/use-exchange-rate.query';
import { useQuotes } from '../api/use-quotes.query';
import { usePortfolioSettings } from '../../api/use-portfolio-settings.query';
import type { BaseCurrency } from '../../types';
import type { CatalogAsset, ExchangeRateView, Quote } from '../types';
import { needsExchangeRate, previewValueMinor } from './preview-value';
import { normalizeDecimalInput } from './quantity-decimals';

export interface PreviewValue {
    readonly quote: Quote | null;
    readonly baseCurrency: BaseCurrency;
    readonly valueMinor: number | null;
    readonly exchangeMissing: boolean;
}

export function usePreviewValue(asset: CatalogAsset, quantityText: string): PreviewValue {
    const quote: Quote | null = useQuotes([asset.id]).quotes.get(asset.id) ?? null;
    const baseCurrency: BaseCurrency = usePortfolioSettings().data?.baseCurrency ?? 'BRL';
    const needsRate: boolean = quote !== null && needsExchangeRate(quote.currency, baseCurrency);
    const rate: ExchangeRateView | undefined = useExchangeRate('USD', needsRate).data;
    const valueMinor: number | null =
        quote === null
            ? null
            : previewValueMinor({
                  quantity: normalizeDecimalInput(quantityText),
                  price: quote.price,
                  priceCurrency: quote.currency,
                  baseCurrency,
                  brlPerUsd: rate?.brlPerUnit ?? null
              });
    return { quote, baseCurrency, valueMinor, exchangeMissing: needsRate && rate === undefined };
}

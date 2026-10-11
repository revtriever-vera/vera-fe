import type { ReactElement } from 'react';
import { cn } from '@/shared/lib/cn';
import { formatCurrency } from '@/shared/lib/format/currency';
import type { SupportedLocale } from '@/shared/lib/locale';
import { useUiLocale } from './ui-text';

export interface MoneyProps {
    readonly amountMinor: number;
    readonly currency: string;
    readonly tone?: 'default' | 'positive';
    readonly className?: string;
}

export function Money({ amountMinor, currency, tone = 'default', className }: MoneyProps): ReactElement {
    const locale: SupportedLocale = useUiLocale();
    return (
        <span className={cn('numeric', tone === 'positive' && 'text-positive font-semibold', className)}>
            {formatCurrency(amountMinor, currency, locale)}
        </span>
    );
}

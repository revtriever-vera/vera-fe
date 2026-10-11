import type { ReactElement } from 'react';
import { cn } from '@/shared/lib/cn';
import { Money } from '@/shared/ui/money';

const MINUS_SIGN: string = '−';
const PLUS_SIGN: string = '+';

export interface SignedAmountProps {
    readonly amountMinor: number;
    readonly currency: string;
    readonly className?: string;
}

function signOf(amountMinor: number): string {
    if (amountMinor === 0) {
        return '';
    }
    return amountMinor > 0 ? PLUS_SIGN : MINUS_SIGN;
}

export function SignedAmount({ amountMinor, currency, className }: SignedAmountProps): ReactElement {
    const incoming: boolean = amountMinor > 0;
    return (
        <span className={cn('numeric whitespace-nowrap', incoming && 'font-semibold text-positive', className)}>
            <span>{signOf(amountMinor)}</span>
            <Money amountMinor={Math.abs(amountMinor)} currency={currency} />
        </span>
    );
}

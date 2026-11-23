import { ShieldAlert, ShieldCheck, ShieldOff, type LucideIcon } from 'lucide-react';
import type { TFunction } from 'i18next';
import { useMemo, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { UseQueryResult } from '@tanstack/react-query';
import { cn } from '@/shared/lib/cn';
import { formatCurrency, formatCurrencyCompact } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { useDebouncedValue } from '@/shared/lib/use-debounced-value';
import { Skeleton } from '@/shared/ui/skeleton';
import { useFgcSimulation } from '../api/use-fgc-simulation.query';
import { toFgcBody } from '../lib/fgc-body';
import type { FixedIncomeFormInput } from '../schemas/fixed-income.schema';
import { FGC_LIMIT_MINOR, type FgcSimulation, type FgcSimulationBody, type FgcVerdict } from '../types';

const SIMULATION_DEBOUNCE_MS: number = 400;

export interface FgcPreviewProps {
    readonly values: FixedIncomeFormInput;
    readonly excludeTitleId?: string;
}

const ICONS: Readonly<Record<FgcVerdict, LucideIcon>> = {
    covered: ShieldCheck,
    over_limit: ShieldAlert,
    not_covered_kind: ShieldOff,
    not_associated: ShieldOff,
    not_calculated: ShieldOff
};

function useDebouncedFgcBody(values: FixedIncomeFormInput, excludeTitleId: string | undefined): FgcSimulationBody | null {
    const body: FgcSimulationBody | null = toFgcBody(values, excludeTitleId);
    const debounced: string | null = useDebouncedValue(body === null ? null : JSON.stringify(body), SIMULATION_DEBOUNCE_MS);
    return useMemo((): FgcSimulationBody | null => (debounced === null ? null : (JSON.parse(debounced) as FgcSimulationBody)), [debounced]);
}

function sentence(result: FgcSimulation, kindLabel: string, locale: SupportedLocale, t: TFunction<'portfolioAssets'>): string {
    return t(`fixedIncome.fgcPreview.${result.verdict}`, {
        total: formatCurrency(result.totalAfterMinor, 'BRL', locale),
        over: formatCurrency(result.overMinor, 'BRL', locale),
        limit: formatCurrencyCompact(FGC_LIMIT_MINOR, 'BRL', locale),
        group: result.groupName,
        kind: kindLabel
    });
}

function Verdict({ result, kindLabel }: { readonly result: FgcSimulation; readonly kindLabel: string }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const locale: SupportedLocale = useLocale();
    const Icon: LucideIcon = ICONS[result.verdict];
    const attention: boolean = result.verdict === 'over_limit';
    return (
        <p
            className={cn(
                'flex items-start gap-2 text-xs',
                attention ? 'rounded-control border border-caution/30 bg-caution/10 p-3 text-content' : 'text-content-muted'
            )}
        >
            <Icon className={cn('mt-px size-4 shrink-0', attention && 'text-caution')} aria-hidden="true" />
            {sentence(result, kindLabel, locale, t)}
        </p>
    );
}

export function FgcPreview({ values, excludeTitleId }: FgcPreviewProps): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const body: FgcSimulationBody | null = useDebouncedFgcBody(values, excludeTitleId);
    const simulation: UseQueryResult<FgcSimulation> = useFgcSimulation(body);
    if (body === null || simulation.isError) {
        return null;
    }
    return (
        <div role="status" aria-live="polite" aria-busy={simulation.isFetching}>
            {simulation.data === undefined ? (
                <Skeleton className="h-10 w-full" />
            ) : (
                <Verdict result={simulation.data} kindLabel={t(`fixedIncome.kinds.${values.kind}`)} />
            )}
        </div>
    );
}

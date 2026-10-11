import type { ReactElement } from 'react';
import { Check, CircleAlert } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Badge } from '@/shared/ui/badge';
import { formatTargetBps } from '../../lib/format-bps';
import { totalChipState, type TotalChipState } from '../lib/targets-form';

export interface TargetsTotalChipProps {
    readonly sumBps: number;
}

const BPS_PER_POINT: number = 100;

export function TargetsTotalChip({ sumBps }: TargetsTotalChipProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const locale: SupportedLocale = useLocale();
    const state: TotalChipState = totalChipState(sumBps);
    const total: string = formatTargetBps(sumBps, locale);
    const pp: string = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(state.diffBps / BPS_PER_POINT);
    const labels: Record<TotalChipState['kind'], string> = {
        ok: t('targets.total', { total }),
        missing: t('targets.totalMissing', { total, pp }),
        excess: t('targets.totalExcess', { total, pp })
    };
    const Icon: typeof Check = state.kind === 'ok' ? Check : CircleAlert;
    return (
        <Badge tone={state.kind === 'ok' ? 'positive' : 'critical'} role="status" aria-live="polite" className="text-sm">
            <Icon className="size-4" aria-hidden="true" strokeWidth={2.5} />
            {labels[state.kind]}
        </Badge>
    );
}

import type { ReactElement } from 'react';
import { Check, CircleAlert } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Badge } from '@/shared/ui/badge';
import { formatTargetBps } from '../../lib/format-bps';
import { totalChipState, type TotalChipState } from '../lib/targets-form';

export interface AssetTargetsTotalChipProps {
    readonly sumBps: number;
}

const BPS_PER_POINT: number = 100;

export function AssetTargetsTotalChip({ sumBps }: AssetTargetsTotalChipProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const locale: SupportedLocale = useLocale();
    const state: TotalChipState = totalChipState(sumBps);
    const total: string = formatTargetBps(sumBps, locale);
    const pp: string = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(state.diffBps / BPS_PER_POINT);
    const automatic: boolean = sumBps === 0;
    const labels: Record<TotalChipState['kind'], string> = {
        ok: t('classDetail.total', { total }),
        missing: automatic ? t('classDetail.totalAutomatic', { total }) : t('classDetail.totalMissing', { total, pp }),
        excess: t('classDetail.totalExcess', { total, pp })
    };
    const valid: boolean = state.kind === 'ok' || automatic;
    const Icon: typeof Check = valid ? Check : CircleAlert;
    return (
        <Badge tone={valid ? 'positive' : 'critical'} role="status" aria-live="polite" className="text-sm">
            <Icon className="size-4" aria-hidden="true" strokeWidth={2.5} />
            {labels[state.kind]}
        </Badge>
    );
}

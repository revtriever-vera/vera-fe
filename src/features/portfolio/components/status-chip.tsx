import type { ReactElement } from 'react';
import { ArrowDown, ArrowUp, Check, type LucideIcon } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Badge } from '@/shared/ui/badge';
import { formatPpBps } from '../lib/format-bps';
import { DEVIATION_STATUS, type DeviationStatus } from '../types';

export interface StatusChipProps {
    readonly status: DeviationStatus;
    readonly deviationBps: number;
}

const ICONS: Readonly<Record<DeviationStatus, LucideIcon>> = {
    [DEVIATION_STATUS.within]: Check,
    [DEVIATION_STATUS.above]: ArrowUp,
    [DEVIATION_STATUS.below]: ArrowDown
};

export function StatusChip({ status, deviationBps }: StatusChipProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    const locale: SupportedLocale = useLocale();
    const Icon: LucideIcon = ICONS[status];
    const pp: string = formatPpBps(deviationBps, locale);
    const text: string = status === DEVIATION_STATUS.within ? t('status.within') : t(`status.${status}`, { pp });
    return (
        <Badge tone={status === DEVIATION_STATUS.within ? 'positive' : 'caution'}>
            <Icon aria-hidden="true" className="h-3 w-3" strokeWidth={2.5} />
            {text}
        </Badge>
    );
}

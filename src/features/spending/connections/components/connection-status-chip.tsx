import type { ReactElement } from 'react';
import { CircleAlert, CircleCheck, CirclePause, CircleX, type LucideIcon } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Badge } from '@/shared/ui/badge';
import type { ConnectionStatus } from '../types';

type Tone = 'positive' | 'caution' | 'critical' | 'neutral';

const TONES: Readonly<Record<ConnectionStatus, Tone>> = {
    active: 'positive',
    needs_attention: 'caution',
    revoked: 'critical',
    paused: 'neutral'
};

const ICONS: Readonly<Record<ConnectionStatus, LucideIcon>> = {
    active: CircleCheck,
    needs_attention: CircleAlert,
    revoked: CircleX,
    paused: CirclePause
};

export function ConnectionStatusChip({ status }: { readonly status: ConnectionStatus }): ReactElement {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    const Icon: LucideIcon = ICONS[status];
    return (
        <Badge tone={TONES[status]}>
            <Icon className="size-3.5" aria-hidden="true" />
            {t(`banks.status.${status}`)}
        </Badge>
    );
}

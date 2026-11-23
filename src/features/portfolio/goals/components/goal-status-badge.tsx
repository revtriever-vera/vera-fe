import type { ReactElement } from 'react';
import { AlertTriangle, Check, Clock, type LucideIcon } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Badge } from '@/shared/ui/badge';
import { GOAL_STATUS, type GoalStatus } from '../types';

type BadgeTone = 'positive' | 'caution' | 'critical';

interface StatusLook {
    readonly tone: BadgeTone;
    readonly icon: LucideIcon;
}

const LOOKS: Readonly<Record<GoalStatus, StatusLook>> = {
    [GOAL_STATUS.done]: { tone: 'positive', icon: Check },
    [GOAL_STATUS.onTrack]: { tone: 'positive', icon: Check },
    [GOAL_STATUS.behind]: { tone: 'caution', icon: Clock },
    [GOAL_STATUS.overdue]: { tone: 'critical', icon: AlertTriangle }
};

export function GoalStatusBadge({ status }: { readonly status: GoalStatus }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    const look: StatusLook = LOOKS[status];
    const Icon: LucideIcon = look.icon;
    return (
        <Badge tone={look.tone}>
            <Icon aria-hidden="true" className="size-3" strokeWidth={2.5} />
            {t(`status.${status}`)}
        </Badge>
    );
}

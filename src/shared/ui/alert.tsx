import type { ReactElement, ReactNode } from 'react';
import { CircleAlert, CircleCheck, TriangleAlert, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { type UiText, useUiText } from './ui-text';

export type AlertTone = 'critical' | 'caution' | 'positive';

const SURFACES: Record<AlertTone, string> = {
    critical: 'border-critical/30 bg-critical/10',
    caution: 'border-caution/30 bg-caution/10',
    positive: 'border-positive/30 bg-positive/10'
};

const TITLES: Record<AlertTone, string> = {
    critical: 'text-critical',
    caution: 'text-caution',
    positive: 'text-positive'
};

const DEFAULT_ICONS: Record<AlertTone, LucideIcon> = {
    critical: CircleAlert,
    caution: TriangleAlert,
    positive: CircleCheck
};

export interface AlertProps {
    readonly title: string;
    readonly detail?: string;
    readonly requestId?: string | null;
    readonly tone?: AlertTone;
    readonly action?: ReactNode;
    readonly icon?: ReactNode;
}

export function Alert({ title, detail, requestId, tone = 'critical', action, icon }: AlertProps): ReactElement {
    const t: UiText = useUiText();
    const DefaultIcon: LucideIcon = DEFAULT_ICONS[tone];
    const shownIcon: ReactNode = icon ?? <DefaultIcon className="size-4" aria-hidden="true" />;

    return (
        <div role="alert" className={cn('flex items-start justify-between gap-4 rounded-card border p-3 text-sm', SURFACES[tone])}>
            <div className="flex items-start gap-2.5">
                <span className={cn('mt-px shrink-0', TITLES[tone])}>{shownIcon}</span>
                <div className="flex flex-col gap-1">
                    <span className={cn('font-medium', TITLES[tone])}>{title}</span>
                    {detail && <span className="text-content-muted">{detail}</span>}
                    {requestId && <span className="font-mono text-2xs text-content-subtle">{t.requestId(requestId)}</span>}
                </div>
            </div>
            {action ? <div className={cn('shrink-0 self-center font-semibold', TITLES[tone])}>{action}</div> : null}
        </div>
    );
}

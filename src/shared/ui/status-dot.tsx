import type { ReactElement } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Balloon } from './tooltip';

export type StatusLevel = 'blocking' | 'improvable' | 'done';

export const STATUS_LEVELS: Readonly<Record<StatusLevel, StatusLevel>> = {
    blocking: 'blocking',
    improvable: 'improvable',
    done: 'done'
};

export interface StatusDotProps {
    readonly level: StatusLevel | null;
    readonly message: string;
}

function StatusMark({ level, message }: { readonly level: StatusLevel; readonly message: string }): ReactElement {
    if (level === STATUS_LEVELS.blocking) {
        return <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-critical" strokeWidth={2.2} aria-label={message} />;
    }
    if (level === STATUS_LEVELS.done) {
        return <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-positive" strokeWidth={2.2} aria-label={message} />;
    }
    return <span className="block h-1.5 w-1.5 shrink-0 rounded-full bg-caution" role="img" aria-label={message} />;
}

export function StatusDot({ level, message }: StatusDotProps): ReactElement | null {
    if (level === null) {
        return null;
    }
    return (
        <Balloon text={message}>
            <span className="flex items-center">
                <StatusMark level={level} message={message} />
            </span>
        </Balloon>
    );
}

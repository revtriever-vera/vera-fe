import type { ReactElement } from 'react';
import { Loading, Skeleton } from './skeleton';

export interface SkeletonFormProps {
    readonly label: string;
    readonly fields?: number;
    readonly withAction?: boolean;
}

export function SkeletonForm({ label, fields = 4, withAction = true }: SkeletonFormProps): ReactElement {
    return (
        <Loading label={label} className="surface-card flex flex-col gap-5 p-5">
            {Array.from({ length: fields }, (_unused: unknown, index: number): ReactElement => (
                <div key={index} className="flex flex-col gap-1.5">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-9 w-full" />
                </div>
            ))}
            {withAction ? <Skeleton className="h-9 w-32" /> : null}
        </Loading>
    );
}

export interface SkeletonPanelProps {
    readonly label: string;
    readonly lines?: number;
    readonly withActions?: boolean;
}

export function SkeletonPanel({ label, lines = 3, withActions = false }: SkeletonPanelProps): ReactElement {
    return (
        <Loading label={label} className="surface-card flex flex-col gap-4 p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-44" />
                    <Skeleton className="h-3 w-64" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="flex flex-col gap-2">
                {Array.from({ length: lines }, (_unused: unknown, index: number): ReactElement => (
                    <div key={index} className="flex items-center justify-between gap-3">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-40" />
                    </div>
                ))}
            </div>
            {withActions ? (
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-9 w-24" />
                </div>
            ) : null}
        </Loading>
    );
}

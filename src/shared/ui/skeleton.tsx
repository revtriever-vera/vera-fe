import type { ReactElement, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export function Skeleton({ className }: { readonly className?: string }): ReactElement {
    return <div className={cn('animate-pulse rounded-control bg-surface-muted motion-reduce:animate-none', className)} />;
}

export interface LoadingProps {
    readonly label: string;
    readonly children: ReactNode;
    readonly className?: string;
}

export function Loading({ label, children, className }: LoadingProps): ReactElement {
    return (
        <div role="status" aria-busy="true" aria-live="polite" className={className}>
            {children}
            <span className="sr-only">{label}</span>
        </div>
    );
}

const LINE_WIDTHS: readonly string[] = ['w-full', 'w-11/12', 'w-4/5', 'w-2/3'];

export interface SkeletonTextProps {
    readonly lines?: number;
    readonly className?: string;
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps): ReactElement {
    return (
        <div className={cn('flex flex-col gap-2', className)}>
            {Array.from({ length: lines }, (_unused: unknown, index: number): ReactElement => (
                <Skeleton key={index} className={cn('h-3', LINE_WIDTHS[index % LINE_WIDTHS.length])} />
            ))}
        </div>
    );
}

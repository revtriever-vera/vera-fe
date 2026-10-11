import type { ReactElement } from 'react';
import { cn } from '@/shared/lib/cn';

export function initialOf(name: string): string {
    const trimmed: string = name.trim();
    const first: string = Array.from(trimmed)[0] ?? '';
    return first === '' ? '?' : first.toLocaleUpperCase();
}

export interface AvatarProps {
    readonly name: string;
    readonly className?: string;
}

export function Avatar({ name, className }: AvatarProps): ReactElement {
    return (
        <span
            aria-hidden="true"
            className={cn(
                'grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-strong font-bold text-accent-contrast',
                className
            )}
        >
            {initialOf(name)}
        </span>
    );
}

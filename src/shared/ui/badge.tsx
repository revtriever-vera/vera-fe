import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassProp } from 'class-variance-authority/types';
import type { HTMLAttributes, ReactElement } from 'react';
import { cn } from '@/shared/lib/cn';

type BadgeVariantProps = {
    tone?: 'neutral' | 'accent' | 'positive' | 'caution' | 'critical' | null;
} & ClassProp;

const badgeVariants: (props?: BadgeVariantProps) => string = cva(
    'inline-flex items-center gap-1 whitespace-nowrap rounded-control px-2 py-0.5 text-xs font-semibold',
    {
        variants: {
            tone: {
                neutral: 'bg-surface-muted text-content-muted',
                accent: 'bg-accent/10 text-accent-strong',
                positive: 'bg-positive/10 text-positive',
                caution: 'bg-caution/10 text-caution',
                critical: 'bg-critical/10 text-critical'
            }
        },
        defaultVariants: { tone: 'neutral' }
    }
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps): ReactElement {
    return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

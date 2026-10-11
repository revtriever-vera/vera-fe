import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassProp } from 'class-variance-authority/types';
import type { HTMLAttributes, ReactElement } from 'react';
import { cn } from '@/shared/lib/cn';

type CardVariantProps = {
    variant?: 'default' | 'muted' | null;
} & ClassProp;

const cardVariants: (props?: CardVariantProps) => string = cva('rounded-card p-4', {
    variants: {
        variant: {
            default: 'bg-surface shadow-card',
            muted: 'border border-border bg-surface-muted'
        }
    },
    defaultVariants: { variant: 'default' }
});

export interface CardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export function Card({ className, variant, ...props }: CardProps): ReactElement {
    return <div className={cn(cardVariants({ variant }), className)} {...props} />;
}

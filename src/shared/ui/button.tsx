import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassProp } from 'class-variance-authority/types';
import type { ButtonHTMLAttributes, ReactElement } from 'react';
import { cn } from '@/shared/lib/cn';

type ButtonVariantProps = {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | null;
    size?: 'sm' | 'md' | 'lg' | null;
    block?: boolean | null;
} & ClassProp;

const buttonVariants: (props?: ButtonVariantProps) => string = cva(
    'inline-flex items-center justify-center gap-2 rounded-control font-semibold shadow-control transition-colors disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                primary: 'bg-accent-strong text-accent-contrast hover:opacity-90',
                secondary: 'border border-border bg-surface text-content hover:bg-surface-muted',
                ghost: 'text-content-muted hover:bg-surface-muted',
                danger: 'bg-critical text-white hover:opacity-90'
            },
            size: {
                sm: 'h-8 px-3 text-xs',
                md: 'h-9 px-3.5 text-sm',
                lg: 'h-11 px-5 text-sm'
            },
            block: { true: 'w-full', false: '' }
        },
        defaultVariants: { variant: 'primary', size: 'md', block: false }
    }
);

function ButtonSpinner(): ReactElement {
    return (
        <svg className="size-4 shrink-0 animate-spin" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
            <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    readonly loading?: boolean;
}

export function Button({ className, variant, size, block, loading = false, disabled, children, ...props }: ButtonProps): ReactElement {
    return (
        <button
            className={cn(buttonVariants({ variant, size, block }), className)}
            disabled={disabled === true || loading}
            aria-busy={loading}
            {...props}
        >
            {loading ? <ButtonSpinner /> : null}
            {children}
        </button>
    );
}

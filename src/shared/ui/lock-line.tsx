import type { ReactElement, ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { Lock } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { buttonVariants } from './button';

const PLAN_PARAMS: { readonly tab: string } = { tab: 'plan' };

export type LockAction = 'premium' | 'ownerOnly' | 'none';

export interface LockLineProps {
    readonly children: ReactNode;
    readonly action?: LockAction;
    readonly onActionClick?: () => void;
}

function LockActionView({ action, onClick }: { readonly action: LockAction; readonly onClick?: () => void }): ReactElement | null {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    if (action === 'none') {
        return null;
    }
    if (action === 'ownerOnly') {
        return <span className="text-sm font-semibold text-content-muted">{t('lock.askOwner')}</span>;
    }
    return (
        <Link to="/settings/$tab" params={PLAN_PARAMS} onClick={onClick} className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
            {t('lock.cta')}
        </Link>
    );
}

export function LockLine({ children, action = 'premium', onActionClick }: LockLineProps): ReactElement {
    return (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2.5 text-sm text-content-muted">
            <Lock className="size-4 shrink-0 text-content-subtle" aria-hidden="true" />
            <span className="min-w-56 flex-1">{children}</span>
            <LockActionView action={action} onClick={onActionClick} />
        </div>
    );
}

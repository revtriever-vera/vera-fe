import type { ReactElement, ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import type { StepActions } from '../lib/use-step-actions';

export interface StepFooterProps {
    readonly actions: StepActions;
    readonly backTo?: string;
    readonly continueLabel: string | null;
    readonly children?: ReactNode;
}

export function StepFooter({ actions, backTo, continueLabel, children }: StepFooterProps): ReactElement {
    const { t }: UseTranslationResponse<'onboarding', undefined> = useTranslation('onboarding');
    const busy: boolean = actions.completing || actions.skipping;
    const canContinue: boolean = continueLabel !== null;

    return (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            {backTo === undefined ? (
                <span />
            ) : (
                <Link
                    to={backTo}
                    className="inline-flex h-9 items-center gap-2 rounded-control px-3.5 text-sm font-semibold text-content-muted hover:bg-surface-muted"
                >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    {t('back')}
                </Link>
            )}
            <div className="flex flex-wrap items-center justify-end gap-2.5">
                {children}
                <Button variant={canContinue ? 'ghost' : 'primary'} disabled={busy} loading={actions.skipping} onClick={actions.skip}>
                    {t(canContinue ? 'skipShort' : 'skipForNow')}
                </Button>
                {canContinue ? (
                    <Button disabled={busy} loading={actions.completing} onClick={actions.complete}>
                        {continueLabel}
                    </Button>
                ) : null}
            </div>
        </div>
    );
}

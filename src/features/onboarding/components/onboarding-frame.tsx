import { useState, type ReactElement, type ReactNode } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { X } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { Button } from '@/shared/ui/button';
import { useOnboardingState } from '../api/use-onboarding-state.query';
import { onboardingProgress, showsProgress } from '../lib/onboarding-progress';
import { ONBOARDING_PATHS } from '../types';
import { DismissDialog } from './dismiss-dialog';
import { OnboardingProgressBar } from './onboarding-progress';

const GUTTER: string = 'px-[clamp(16px,4vw,40px)]';

function SkipControl(): ReactElement {
    const { t }: UseTranslationResponse<'onboarding', undefined> = useTranslation('onboarding');
    const [confirming, setConfirming] = useState<boolean>(false);

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                onClick={(): void => {
                    setConfirming(true);
                }}
            >
                {t('skip')}
                <X className="size-3.5" aria-hidden="true" />
            </Button>
            {confirming ? (
                <DismissDialog
                    onClose={(): void => {
                        setConfirming(false);
                    }}
                />
            ) : null}
        </>
    );
}

export function OnboardingFrame({ children }: { readonly children: ReactNode }): ReactElement {
    const { t }: UseTranslationResponse<'onboarding', undefined> = useTranslation('onboarding');
    const pathname: string = useRouterState({ select: (state): string => state.location.pathname });
    const { data } = useOnboardingState();
    const canSkip: boolean = pathname.replace(/\/+$/, '') !== ONBOARDING_PATHS.done;

    return (
        <div className="flex min-h-dvh flex-col bg-canvas bg-[radial-gradient(ellipse_80%_60%_at_0%_0%,var(--color-accent-soft),transparent_70%)]">
            <header className={`flex flex-wrap items-center justify-between gap-x-5 gap-y-3 py-4 ${GUTTER}`}>
                <BrandLogo />
                {showsProgress(pathname) ? (
                    <div className="order-3 flex w-full justify-center min-[861px]:order-none min-[861px]:w-auto min-[861px]:flex-1">
                        <OnboardingProgressBar progress={onboardingProgress(data, pathname)} />
                    </div>
                ) : null}
                {canSkip ? <SkipControl /> : null}
            </header>
            <main aria-label={t('regionLabel')} className={`grid flex-1 content-start justify-items-center pt-2 pb-12 ${GUTTER}`}>
                {children}
            </main>
        </div>
    );
}

import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { Rocket } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useOnboardingState } from '../api/use-onboarding-state.query';
import { ONBOARDING_PATHS } from '../types';

export function ResumeLink(): ReactElement | null {
    const { t }: UseTranslationResponse<'onboarding', undefined> = useTranslation('onboarding');
    const { data } = useOnboardingState();
    if (data === undefined || data.status === 'closed') {
        return null;
    }
    return (
        <Link
            to={ONBOARDING_PATHS.root}
            className="flex min-h-11 items-center gap-2.5 rounded-control bg-accent-soft px-2.5 py-1.5 font-semibold text-accent-strong transition-colors hover:bg-accent-tint"
        >
            <span className="grid size-[30px] shrink-0 place-items-center rounded-control bg-accent text-accent-contrast">
                <Rocket className="size-4" aria-hidden="true" />
            </span>
            {t('resumeLink')}
        </Link>
    );
}

import { useId, useState, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Card } from '@/shared/ui/card';
import { useNoticeSuffix } from '../lib/use-notice-key';
import type { ConsentState } from '../types';
import { LinkButton } from './link-button';
import { MonthlyReviewPayload } from './monthly-review-payload';
import { AllowRow } from './summary-consent';

export interface MonthlyReviewConsentProps {
    readonly month: string;
    readonly consent: ConsentState;
}

/**
 * The paragraph of the monthly review is written when the month is announced, so a permission given here only
 * reaches the next review: the copy says so instead of promising the text right away.
 */
export function MonthlyReviewConsent({ month, consent }: MonthlyReviewConsentProps): ReactElement {
    const { t }: UseTranslationResponse<'summaries', undefined> = useTranslation('summaries');
    const suffix: '' | 'SelfHosted' = useNoticeSuffix();
    const [open, setOpen] = useState<boolean>(false);
    const titleId: string = useId();
    return (
        <Card role="region" aria-labelledby={titleId} className="flex flex-col gap-3">
            <h3 id={titleId} className="text-base font-semibold">
                {t('monthlyReview.title')}
            </h3>
            <p className="m-0 text-sm">{t('monthlyReview.consentIntro')}</p>
            <p className="m-0 rounded-control bg-surface-muted p-3 text-sm text-content-muted">
                {t(`consent.notice${suffix}`)}{' '}
                <LinkButton
                    onClick={(): void => {
                        setOpen(true);
                    }}
                >
                    {t('consent.seeSent')}
                </LinkButton>
            </p>
            <AllowRow consent={consent} label={t('monthlyReview.consentAllow')} />
            {open ? (
                <MonthlyReviewPayload
                    month={month}
                    onClose={(): void => {
                        setOpen(false);
                    }}
                />
            ) : null}
        </Card>
    );
}

/** Shown after the permission is given on this screen, so the card does not just vanish. */
export function MonthlyReviewConsentGranted(): ReactElement {
    const { t }: UseTranslationResponse<'summaries', undefined> = useTranslation('summaries');
    const titleId: string = useId();
    return (
        <Card role="region" aria-labelledby={titleId} className="flex flex-col gap-2">
            <h3 id={titleId} className="text-base font-semibold">
                {t('monthlyReview.title')}
            </h3>
            <p className="m-0 text-sm text-content-muted">{t('monthlyReview.consentGranted')}</p>
        </Card>
    );
}

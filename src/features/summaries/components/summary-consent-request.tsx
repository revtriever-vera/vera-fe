import { useState, type ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useAiConsent } from '../api/use-ai-consent.query';
import { useNoticeSuffix } from '../lib/use-notice-key';
import { useSummaryParams } from '../lib/use-summary-params';
import { SUMMARY_KIND, type ConsentState, type SummaryParams } from '../types';
import { LinkButton } from './link-button';
import { PayloadTabsModal } from './payload-tabs-modal';
import { AllowRow } from './summary-consent';

function Request({ consent }: { readonly consent: ConsentState }): ReactElement {
    const { t }: UseTranslationResponse<'summaries', undefined> = useTranslation('summaries');
    const suffix: '' | 'SelfHosted' = useNoticeSuffix();
    const portfolioParams: SummaryParams = useSummaryParams(SUMMARY_KIND.portfolio, undefined, undefined);
    const [open, setOpen] = useState<boolean>(false);
    return (
        <div className="flex flex-col gap-3 rounded-card border border-border p-3">
            <p className="m-0 text-sm text-content-muted">
                {t(`consent.notice${suffix}`)}{' '}
                <LinkButton
                    onClick={(): void => {
                        setOpen(true);
                    }}
                >
                    {t('consent.seeSent')}
                </LinkButton>
            </p>
            <AllowRow consent={consent} />
            {open ? (
                <PayloadTabsModal
                    portfolioParams={portfolioParams}
                    onClose={(): void => {
                        setOpen(false);
                    }}
                />
            ) : null}
        </div>
    );
}

/** The permission request of the summaries (same notice, same version), for screens that are not a summary card. */
export function SummaryConsentRequest(): ReactElement | null {
    const consent: UseQueryResult<ConsentState> = useAiConsent();
    return consent.data?.needsConsent === true ? <Request consent={consent.data} /> : null;
}

import { useState, type ReactElement } from 'react';
import { RefreshCw } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useRole } from '@/app/providers/use-role';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { summaryErrorMessage } from '../lib/summary-error-message';
import { summaryTitle } from '../lib/summary-titles';
import { useRegenerate, type Regenerate } from '../lib/use-regenerate';
import { useTrackSummaryViewed } from '../lib/use-track-summary-viewed';
import type { SummaryKind, SummaryParams, SummaryView } from '../types';
import { PayloadModal } from './payload-modal';
import { SummaryMetaLine } from './summary-meta-line';
import { SummaryQuota } from './summary-quota';
import { SummaryShell } from './summary-shell';
import { SummaryText } from './summary-text';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { formatDayMonth } from '@/shared/lib/billing/billing-dates';

export interface SummaryBodyProps {
    readonly kind: SummaryKind;
    readonly month: string | undefined;
    readonly params: SummaryParams;
    readonly view: SummaryView;
}

function RegenerateButton({ regenerate, view }: { readonly regenerate: Regenerate; readonly view: SummaryView }): ReactElement | null {
    const { t }: UseTranslationResponse<'summaries', undefined> = useTranslation('summaries');
    const { canEdit } = useRole();
    if (!canEdit || view.source === 'fixed') {
        return null;
    }
    return (
        <Button
            size="sm"
            variant={view.stale ? 'primary' : 'secondary'}
            loading={regenerate.pending}
            disabled={view.usage.state === 'paused'}
            onClick={(): void => void regenerate.run()}
        >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            {t('regenerate.action')}
        </Button>
    );
}

function RegenerateError({ error, view }: { readonly error: Error | null; readonly view: SummaryView }): ReactElement | null {
    const { t }: UseTranslationResponse<'summaries', undefined> = useTranslation('summaries');
    const locale: SupportedLocale = useLocale();
    if (error === null) {
        return null;
    }
    return <Alert title={summaryErrorMessage(t, error, formatDayMonth(view.usage.resetsAt, locale))} />;
}

export function SummaryBody({ kind, month, params, view }: SummaryBodyProps): ReactElement {
    const { t }: UseTranslationResponse<'summaries', undefined> = useTranslation('summaries');
    const locale: SupportedLocale = useLocale();
    const regenerate: Regenerate = useRegenerate(kind, params);
    const [payloadOpen, setPayloadOpen] = useState<boolean>(false);
    useTrackSummaryViewed(kind, 'text');
    return (
        <SummaryShell
            title={summaryTitle(t, kind, month, locale)}
            description={
                <SummaryMetaLine
                    kind={kind}
                    view={view}
                    onOpenPayload={(): void => {
                        setPayloadOpen(true);
                    }}
                />
            }
            action={<RegenerateButton regenerate={regenerate} view={view} />}
        >
            <SummaryText paragraphs={view.paragraphs} />
            <RegenerateError error={regenerate.error} view={view} />
            <SummaryQuota usage={view.usage} />
            {payloadOpen ? (
                <PayloadModal
                    kind={kind}
                    params={params}
                    onClose={(): void => {
                        setPayloadOpen(false);
                    }}
                />
            ) : null}
        </SummaryShell>
    );
}

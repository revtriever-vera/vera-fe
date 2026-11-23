import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { summaryMeta, summaryWhen } from '../lib/summary-titles';
import type { SummaryKind, SummaryView } from '../types';
import { LinkButton } from './link-button';

export interface SummaryMetaLineProps {
    readonly kind: SummaryKind;
    readonly view: SummaryView;
    readonly onOpenPayload: () => void;
}

export function SummaryMetaLine({ kind, view, onOpenPayload }: SummaryMetaLineProps): ReactElement {
    const { t }: UseTranslationResponse<'summaries', undefined> = useTranslation('summaries');
    const locale: SupportedLocale = useLocale();
    const when: string = summaryWhen(t, view.generatedAt, new Date(), locale);
    return (
        <p className="m-0">
            {summaryMeta(t, kind, view.stale, when)} <LinkButton onClick={onOpenPayload}>{t('meta.seeSent')}</LinkButton>
        </p>
    );
}

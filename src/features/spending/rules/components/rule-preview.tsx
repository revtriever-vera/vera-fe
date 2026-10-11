import type { ReactElement } from 'react';
import type { TFunction } from 'i18next';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { RulePreview as RulePreviewData } from '../../types';

export interface RulePreviewProps {
    readonly query: UseQueryResult<RulePreviewData>;
    readonly active: boolean;
}

function previewText(t: TFunction<'spendingRules'>, query: UseQueryResult<RulePreviewData>, active: boolean): string {
    if (!active) {
        return '';
    }
    if (query.data !== undefined) {
        return t('preview.result', { pattern: query.data.normalizedPattern, count: query.data.matches });
    }
    return query.isError ? t('preview.failed') : t('preview.loading');
}

export function RulePreview({ query, active }: RulePreviewProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    return (
        <p role="status" aria-live="polite" className="min-h-9 rounded-control bg-surface-muted px-3 py-2 text-sm text-content-muted">
            {previewText(t, query, active)}
        </p>
    );
}

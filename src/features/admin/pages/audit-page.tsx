import type { ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { EmptyState } from '@/shared/ui/empty-state';
import { FailureAlert } from '@/shared/ui/failure-alert';
import { useAudit } from '../api/use-audit.query';
import type { AuditList } from '../types';
import { AuditTable } from '../components/audit-table';
import { platformRefusal } from '../lib/platform-refusal';

export function AuditPage(): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const audit: UseQueryResult<AuditList> = useAudit();
    const failed: boolean = audit.isError && platformRefusal(audit.error) === null;

    return (
        <section className="flex flex-col gap-4 px-page-x py-6">
            <header>
                <h1 className="text-2xl font-extrabold tracking-tight">{t('auditTitle')}</h1>
                <p className="text-content-muted">{t('auditSubtitle')}</p>
            </header>
            {failed ? <FailureAlert error={audit.error} title={t('auditLoadError')} /> : null}
            {audit.data?.items.length === 0 ? <EmptyState title={t('auditEmptyTitle')} description={t('auditEmptyDescription')} /> : null}
            {audit.data !== undefined && audit.data.items.length > 0 ? <AuditTable entries={audit.data.items} /> : null}
        </section>
    );
}

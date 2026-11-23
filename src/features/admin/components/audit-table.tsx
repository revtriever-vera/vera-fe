import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatDate } from '@/shared/lib/format/date';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import type { AuditEntry } from '../types';

function AuditRow({ entry }: { readonly entry: AuditEntry }): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const locale: SupportedLocale = useLocale();
    const timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return (
        <tr className="border-b border-border align-top last:border-b-0">
            <td className="px-4 py-3 whitespace-nowrap">{formatDate(new Date(entry.createdAt), locale, timeZone)}</td>
            <td className="px-4 py-3 font-mono text-xs">{entry.action}</td>
            <td className="px-4 py-3 font-mono text-xs">{entry.operatorUserId ?? t('auditNobody')}</td>
            <td className="px-4 py-3 font-mono text-xs">{entry.targetCompanyId ?? t('auditNoCompany')}</td>
            <td className="px-4 py-3 font-mono text-xs break-all">{JSON.stringify(entry.meta)}</td>
        </tr>
    );
}

export function AuditTable({ entries }: { readonly entries: readonly AuditEntry[] }): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    return (
        <div className="surface-card overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs text-content-muted uppercase">
                    <tr>
                        <th scope="col" className="px-4 py-3 font-semibold">
                            {t('auditColumnWhen')}
                        </th>
                        <th scope="col" className="px-4 py-3 font-semibold">
                            {t('auditColumnAction')}
                        </th>
                        <th scope="col" className="px-4 py-3 font-semibold">
                            {t('auditColumnOperator')}
                        </th>
                        <th scope="col" className="px-4 py-3 font-semibold">
                            {t('auditColumnCompany')}
                        </th>
                        <th scope="col" className="px-4 py-3 font-semibold">
                            {t('auditColumnDetails')}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {entries.map((entry: AuditEntry): ReactElement => (
                        <AuditRow key={entry.id} entry={entry} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

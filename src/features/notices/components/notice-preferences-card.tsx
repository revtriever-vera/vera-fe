import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Card } from '@/shared/ui/card';
import { FailureAlert } from '@/shared/ui/failure-alert';
import { Loading, Skeleton } from '@/shared/ui/skeleton';
import { Switch } from '@/shared/ui/switch';
import { useNoticePreferences } from '../api/use-notice-preferences.query';
import { noticeDescription, noticeTitle } from '../lib/notice-text';
import { useNoticeToggle, type NoticeToggle } from '../lib/use-notice-toggle';
import type { NoticePreference } from '../types';

interface NoticeRowProps {
    readonly item: NoticePreference;
    readonly busy: boolean;
    readonly onToggle: (type: string, enabled: boolean) => void;
}

function NoticeRow({ item, busy, onToggle }: NoticeRowProps): ReactElement {
    const { t }: UseTranslationResponse<'notices', undefined> = useTranslation('notices');
    return (
        <li className="flex items-center justify-between gap-4 py-3">
            <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-content">{noticeTitle(t, item.type)}</span>
                <span className="text-sm text-content-muted">{noticeDescription(t, item.type)}</span>
            </div>
            <Switch
                checked={item.enabled}
                busy={busy}
                label={noticeTitle(t, item.type)}
                onCheckedChange={(next: boolean): void => {
                    onToggle(item.type, next);
                }}
            />
        </li>
    );
}

export function NoticePreferencesCard(): ReactElement {
    const { t }: UseTranslationResponse<'notices', undefined> = useTranslation('notices');
    const query: ReturnType<typeof useNoticePreferences> = useNoticePreferences();
    const toggle: NoticeToggle = useNoticeToggle();
    const titleId: string = 'notices-title';

    return (
        <Card role="region" aria-labelledby={titleId} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
                <h2 id={titleId} className="text-base font-semibold text-content">
                    {t('title')}
                </h2>
                <p className="text-sm text-content-muted">{t('description')}</p>
            </div>
            {query.isPending ? (
                <Loading label={t('loading')} className="flex flex-col gap-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </Loading>
            ) : null}
            {query.isError ? <FailureAlert error={query.error} title={t('errors.load')} /> : null}
            {query.data === undefined ? null : (
                <ul className="flex flex-col divide-y divide-border">
                    {query.data.items.map((item: NoticePreference): ReactElement => (
                        <NoticeRow key={item.type} item={item} busy={toggle.pendingType === item.type} onToggle={toggle.toggle} />
                    ))}
                </ul>
            )}
        </Card>
    );
}

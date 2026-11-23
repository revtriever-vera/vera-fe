import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import type { ApiError } from '@/shared/lib/api/api-error';
import { Switch } from '@/shared/ui/switch';
import { useNoticeBefore } from '../api/use-notice-before.query';
import { useSetNoticeBefore } from '../api/use-set-notice-before.mutation';
import { recurringErrorMessage } from '../lib/recurring-error-message';

export interface NoticeBeforeSwitchProps {
    readonly seriesId: string;
}

export function NoticeBeforeSwitch({ seriesId }: NoticeBeforeSwitchProps): ReactElement | null {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const toast: ToastApi = useToast();
    const query: ReturnType<typeof useNoticeBefore> = useNoticeBefore();
    const mutation: ReturnType<typeof useSetNoticeBefore> = useSetNoticeBefore();
    if (query.data === undefined) {
        return null;
    }
    return (
        <div className="flex items-start justify-between gap-4 rounded-control border border-border p-3">
            <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-content">{t('detail.noticeBefore')}</span>
                <span className="text-xs text-content-muted">{t('detail.noticeBeforeHint')}</span>
            </div>
            <Switch
                checked={query.data.seriesIds.includes(seriesId)}
                busy={mutation.isPending}
                label={t('detail.noticeBefore')}
                onCheckedChange={(enabled: boolean): void => {
                    mutation.mutate(
                        { seriesId, enabled },
                        {
                            onSuccess: (): void => {
                                toast.show({ tone: 'positive', title: t(enabled ? 'detail.noticeBeforeOn' : 'detail.noticeBeforeOff') });
                            },
                            onError: (error: ApiError): void => {
                                toast.show({ tone: 'critical', title: recurringErrorMessage(t, error) });
                            }
                        }
                    );
                }}
            />
        </div>
    );
}

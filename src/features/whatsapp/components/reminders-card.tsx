import type { ReactElement } from 'react';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Alert } from '@/shared/ui/alert';
import { Card } from '@/shared/ui/card';
import { Loading, Skeleton } from '@/shared/ui/skeleton';
import { useDeleteReminder } from '../api/use-delete-reminder.mutation';
import { useReminders } from '../api/use-reminders.query';
import { reminderWhen } from '../lib/reminder-when';
import { whatsappErrorMessage } from '../lib/whatsapp-error-message';
import type { ReminderItem, RemindersView } from '../types';

function ReminderRow({ item }: { readonly item: ReminderItem }): ReactElement {
    const { t }: UseTranslationResponse<'whatsapp', undefined> = useTranslation('whatsapp');
    const { t: tBilling }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const locale: SupportedLocale = useLocale();
    const toast: ToastApi = useToast();
    const remove: UseMutationResult<void, Error, string> = useDeleteReminder();
    const apply = (): void => {
        remove.mutate(item.id, {
            onSuccess: (): void => {
                track('reminder_deleted');
                toast.show({ tone: 'positive', title: t('toasts.reminderDeleted') });
            },
            onError: (error: Error): void => {
                toast.show({ tone: 'critical', title: whatsappErrorMessage(t, tBilling, error, locale) });
            }
        });
    };
    return (
        <li className="flex items-center justify-between gap-3 border-t border-border py-2 first:border-t-0">
            <div className="flex min-w-0 flex-col">
                <span className="text-xs text-content-muted">{reminderWhen(t, item, locale)}</span>
                <span className="text-sm text-content">{item.text}</span>
            </div>
            <button
                type="button"
                aria-label={t('reminders.delete', { text: item.text })}
                disabled={remove.isPending}
                onClick={apply}
                className="flex size-8 shrink-0 items-center justify-center rounded-control text-content-muted hover:bg-surface-muted disabled:opacity-50"
            >
                <Trash2 className="size-4" aria-hidden="true" />
            </button>
        </li>
    );
}

function RemindersList({ view }: { readonly view: RemindersView }): ReactElement {
    const { t }: UseTranslationResponse<'whatsapp', undefined> = useTranslation('whatsapp');
    if (view.items.length === 0) {
        return <p className="text-sm text-content-muted">{t('reminders.empty')}</p>;
    }
    return (
        <ul className="flex flex-col">
            {view.items.map((item: ReminderItem): ReactElement => (
                <ReminderRow key={item.id} item={item} />
            ))}
        </ul>
    );
}

function RemindersBody(): ReactElement {
    const { t }: UseTranslationResponse<'whatsapp', undefined> = useTranslation('whatsapp');
    const { t: tBilling }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const locale: SupportedLocale = useLocale();
    const reminders: UseQueryResult<RemindersView> = useReminders();
    if (reminders.isPending) {
        return (
            <Loading label={t('reminders.loading')}>
                <Skeleton className="h-10 w-full" />
            </Loading>
        );
    }
    if (reminders.error) {
        return <Alert title={whatsappErrorMessage(t, tBilling, reminders.error, locale)} />;
    }
    return <RemindersList view={reminders.data} />;
}

export function RemindersCard({ paused }: { readonly paused: boolean }): ReactElement {
    const { t }: UseTranslationResponse<'whatsapp', undefined> = useTranslation('whatsapp');
    return (
        <Card className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold text-content">{t('reminders.title')}</h2>
                <p className="text-sm text-content-muted">{t('reminders.description')}</p>
            </div>
            <RemindersBody />
            {paused ? <p className="text-xs text-content-muted">{t('reminders.pausedNote')}</p> : null}
        </Card>
    );
}

import type { ReactElement } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import { Button } from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import { useCalendarStart } from '../api/use-calendar-start.mutation';
import { calendarErrorMessage } from '../lib/calendar-error-message';
import { isHttpsUrl } from '../lib/safe-redirect';
import type { StartView } from '../types';

interface GoogleStart {
    readonly pending: boolean;
    readonly go: () => void;
}

function useStartGoogle(): GoogleStart {
    const { t }: UseTranslationResponse<'calendar', undefined> = useTranslation('calendar');
    const toast: ToastApi = useToast();
    const mutation: UseMutationResult<StartView, Error, void> = useCalendarStart();
    const fail = (message: string): void => {
        toast.show({ tone: 'critical', title: message });
    };
    const go = (): void => {
        mutation.mutate(undefined, {
            onSuccess: (view: StartView): void => {
                if (!isHttpsUrl(view.url)) {
                    fail(t('errors.generic'));
                    return;
                }
                track('calendar_connect_started');
                window.location.assign(view.url);
            },
            onError: (error: Error): void => {
                fail(calendarErrorMessage(t, error));
            }
        });
    };
    return { pending: mutation.isPending, go };
}

function Point({ title, text }: { readonly title: string; readonly text: string }): ReactElement {
    return (
        <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold text-content">{title}</p>
            <p className="text-sm text-content-muted">{text}</p>
        </div>
    );
}

export function ConnectCalendarModal({ onClose }: { readonly onClose: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'calendar', undefined> = useTranslation('calendar');
    const start: GoogleStart = useStartGoogle();
    return (
        <Modal
            title={t('modal.title')}
            onClose={onClose}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>
                        {t('modal.cancel')}
                    </Button>
                    <Button disabled={start.pending} onClick={start.go}>
                        {t('modal.continue')}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-4">
                <p className="text-sm text-content-muted">{t('modal.intro')}</p>
                <Point title={t('modal.permissionTitle')} text={t('modal.permissionText')} />
                <Point title={t('modal.notAccessedTitle')} text={t('modal.notAccessedText')} />
            </div>
        </Modal>
    );
}

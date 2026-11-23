import { useEffect, useRef, type RefObject } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import type { CalendarReturn } from '../types';
import { calendarCodeMessage } from './calendar-error-message';

export function useCalendarReturn(result: CalendarReturn, clear: () => void): void {
    const { t }: UseTranslationResponse<'calendar', undefined> = useTranslation('calendar');
    const toast: ToastApi = useToast();
    const handled: RefObject<boolean> = useRef<boolean>(false);
    useEffect((): void => {
        if (handled.current) {
            return;
        }
        if (result.connected) {
            handled.current = true;
            track('calendar_connected');
            toast.show({ tone: 'positive', title: t('toasts.connected') });
            clear();
            return;
        }
        if (result.error !== undefined) {
            handled.current = true;
            track('calendar_connect_failed', { code: result.error });
            toast.show({ tone: 'critical', title: calendarCodeMessage(t, result.error) });
            clear();
        }
    }, [result, toast, t, clear]);
}

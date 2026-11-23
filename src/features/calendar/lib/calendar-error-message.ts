import type { ParseKeys, TFunction } from 'i18next';
import { ApiError } from '@/shared/lib/api/api-error';
import { CALENDAR_ERROR } from '../types';

type CalendarKey = ParseKeys<'calendar'>;

const CODE_KEYS: Readonly<Record<string, CalendarKey>> = {
    [CALENDAR_ERROR.consentDenied]: 'errors.consentDenied',
    [CALENDAR_ERROR.scopeMissing]: 'errors.scopeMissing',
    [CALENDAR_ERROR.stateInvalid]: 'errors.stateInvalid',
    [CALENDAR_ERROR.providerUnavailable]: 'errors.providerUnavailable',
    [CALENDAR_ERROR.providerDisabled]: 'errors.providerDisabled'
};

export function calendarCodeMessage(t: TFunction<'calendar'>, code: string): string {
    return t(CODE_KEYS[code] ?? 'errors.generic');
}

export function calendarErrorMessage(t: TFunction<'calendar'>, error: Error): string {
    return calendarCodeMessage(t, error instanceof ApiError ? error.problem.type : '');
}

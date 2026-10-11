import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';

export interface UiText {
    readonly previous: string;
    readonly next: string;
    readonly close: string;
    readonly cancel: string;
    readonly pleaseWait: string;
    readonly previousMonth: string;
    readonly nextMonth: string;
    readonly openCalendarFor: (label: string) => string;
    readonly datePlaceholder: string;
    readonly hidePassword: string;
    readonly showPassword: string;
    readonly copied: string;
    readonly change: string;
    readonly dropFileHere: string;
    readonly orClickToChoose: string;
    readonly fileRejected: string;
    readonly requestId: (value: string) => string;
    readonly dismissAlert: string;
    readonly sampleExplore: string;
    readonly sampleBannerText: string;
    readonly sampleClear: string;
    readonly sampleConfirmTitle: string;
    readonly sampleConfirmBody: string;
}

export function useUiText(): UiText {
    const { t }: UseTranslationResponse<'common', undefined> = useTranslation();
    return {
        previous: t('previous'),
        next: t('next'),
        close: t('close'),
        cancel: t('cancel'),
        pleaseWait: t('pleaseWait'),
        previousMonth: t('previousMonth'),
        nextMonth: t('nextMonth'),
        openCalendarFor: (label: string): string => t('openCalendarFor', { label }),
        datePlaceholder: t('datePlaceholder'),
        hidePassword: t('hidePassword'),
        showPassword: t('showPassword'),
        copied: t('copied'),
        change: t('change'),
        dropFileHere: t('dropFileHere'),
        orClickToChoose: t('orClickToChoose'),
        fileRejected: t('fileRejected'),
        requestId: (value: string): string => t('requestId', { value }),
        dismissAlert: t('dismissAlert'),
        sampleExplore: t('sampleExplore'),
        sampleBannerText: t('sampleBannerText'),
        sampleClear: t('sampleClear'),
        sampleConfirmTitle: t('sampleConfirmTitle'),
        sampleConfirmBody: t('sampleConfirmBody')
    };
}

export function useUiLocale(): SupportedLocale {
    return useLocale();
}

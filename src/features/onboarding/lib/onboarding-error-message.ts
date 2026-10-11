import type { TFunction } from 'i18next';
import type ptBROnboarding from '@/shared/lib/i18n/resources/pt-BR/onboarding.json';
import { ApiError } from '@/shared/lib/api/api-error';

type OnboardingDictionary = typeof ptBROnboarding;

type OnboardingKey = { [K in keyof OnboardingDictionary]: OnboardingDictionary[K] extends string ? K : never }[keyof OnboardingDictionary];

export const ALREADY_CLOSED_CODE: string = 'onboarding.already_closed';

const ERROR_KEYS: Readonly<Record<string, OnboardingKey>> = {
    [ALREADY_CLOSED_CODE]: 'errorAlreadyClosed',
    'onboarding.sample_unavailable': 'errorSampleUnavailable',
    'onboarding.sample_failed': 'errorSampleFailed',
    'core.too_many_attempts': 'errorTooManyAttempts'
};

export function isAlreadyClosed(error: Error): boolean {
    return error instanceof ApiError && error.problem.type === ALREADY_CLOSED_CODE;
}

export function onboardingErrorMessage(t: TFunction<'onboarding'>, error: Error): string {
    if (!(error instanceof ApiError)) {
        return t('errorGeneric');
    }
    const key: OnboardingKey | undefined = ERROR_KEYS[error.problem.type];
    return key === undefined ? t('errorGeneric') : t(key);
}

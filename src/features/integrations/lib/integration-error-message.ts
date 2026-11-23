import type { TFunction } from 'i18next';
import { ApiError } from '@/shared/lib/api/api-error';
import type { IntegrationsKey } from './integration-fields';
import type { IntegrationKind } from '../types';

const TOO_MANY_REQUESTS: number = 429;
const TEST_FAILED: string = 'integrations.test_failed';

const CODE_KEYS: Readonly<Record<string, IntegrationsKey>> = {
    'integrations.phone_in_use': 'errors.phoneInUse',
    'integrations.not_available': 'errors.notAvailable',
    'identity.forbidden': 'errors.forbidden',
    validation_failed: 'errors.validation',
    'core.too_many_attempts': 'errors.tooManyAttempts'
};

const REASON_KEYS: Readonly<Record<string, IntegrationsKey>> = {
    unauthorized: 'errors.unauthorized',
    invalid_model: 'errors.invalidModel',
    not_found: 'errors.notFound',
    unreachable: 'errors.unreachable'
};

export function testFailureReason(error: Error): string | null {
    if (!(error instanceof ApiError) || error.problem.type !== TEST_FAILED) {
        return null;
    }
    const reason: unknown = error.problem.meta?.['reason'];
    return typeof reason === 'string' ? reason : 'unknown';
}

function reasonKey(reason: string, kind: IntegrationKind): IntegrationsKey {
    if (reason === 'not_found' && kind === 'whatsapp') {
        return 'errors.phoneNotFound';
    }
    if (reason === 'unreachable' && kind === 'whatsapp') {
        return 'errors.unreachableWhatsApp';
    }
    return REASON_KEYS[reason] ?? 'errors.generic';
}

export function integrationErrorMessage(t: TFunction<'integrations'>, error: Error, kind: IntegrationKind): string {
    if (!(error instanceof ApiError)) {
        return t('errors.generic');
    }
    const reason: string | null = testFailureReason(error);
    if (reason !== null) {
        return t(reasonKey(reason, kind));
    }
    const code: string = error.status === TOO_MANY_REQUESTS ? 'core.too_many_attempts' : error.problem.type;
    return t(CODE_KEYS[code] ?? 'errors.generic');
}

import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { i18n } from '@/shared/lib/i18n';
import { createAuthenticatorCodeSchema, createRecoveryCodeSchema } from './totp-code.schema';

const t: TFunction<'admin'> = i18n.getFixedT('pt-BR', 'admin');

describe('createAuthenticatorCodeSchema', () => {
    it('accepts six digits, trimmed', () => {
        expect(createAuthenticatorCodeSchema(t).parse({ code: ' 123456 ' })).toEqual({ code: '123456' });
    });

    it('refuses anything else with the translated message', () => {
        const result: ReturnType<ReturnType<typeof createAuthenticatorCodeSchema>['safeParse']> = createAuthenticatorCodeSchema(
            t
        ).safeParse({ code: '12345a' });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0]?.message).toBe('Digite os 6 dígitos do código.');
    });
});

describe('createRecoveryCodeSchema', () => {
    it('accepts a recovery code of the API length', () => {
        expect(createRecoveryCodeSchema(t).safeParse({ code: 'abcd-efgh-ijkl' }).success).toBe(true);
    });

    it('refuses a short or a long value', () => {
        expect(createRecoveryCodeSchema(t).safeParse({ code: 'abc' }).success).toBe(false);
        expect(createRecoveryCodeSchema(t).safeParse({ code: 'a'.repeat(33) }).success).toBe(false);
    });
});

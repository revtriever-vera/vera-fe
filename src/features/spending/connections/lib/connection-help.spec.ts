import { describe, expect, it } from 'vitest';
import { connectionHelpKey, helpTarget } from './connection-help';

describe('connectionHelpKey', () => {
    it.each([
        ['needs_attention', 'login_error', 'banks.help.reconnect'],
        ['needs_attention', 'outdated', 'banks.help.reconnect'],
        ['needs_attention', null, 'banks.help.reconnect'],
        ['needs_attention', 'waiting_user_input', 'banks.help.confirm'],
        ['needs_attention', 'item_not_found', 'banks.help.reauthorize'],
        ['revoked', null, 'banks.help.reauthorize'],
        ['paused', 'credentials_invalid', 'banks.help.paused']
    ] as const)('%s com %s mostra %s', (status, reason, expected) => {
        expect(connectionHelpKey(status, reason)).toBe(expected);
    });

    it('não mostra ajuda para conexão ativa', () => {
        expect(connectionHelpKey('active', null)).toBeNull();
    });
});

describe('helpTarget', () => {
    it('leva ao passo 2, ao passo 4 e à troca de credencial', () => {
        expect(helpTarget('banks.help.reconnect')).toEqual({ kind: 'step', step: 2, label: 'banks.help.step2' });
        expect(helpTarget('banks.help.confirm')).toMatchObject({ step: 2 });
        expect(helpTarget('banks.help.reauthorize')).toMatchObject({ step: 4 });
        expect(helpTarget('banks.help.paused')).toEqual({ kind: 'rotate', label: 'banks.help.rotate' });
    });
});

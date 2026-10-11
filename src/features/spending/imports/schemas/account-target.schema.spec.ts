import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { i18n } from '@/shared/lib/i18n';
import type { AccountView } from '../../types';
import { accountView } from '../../../../../test/fixtures/spending';
import { createAccountTargetSchema, defaultTargetValues, toImportTarget, type AccountTargetFormValues } from './account-target.schema';

const t: TFunction<'spendingImports'> = i18n.getFixedT('pt-BR', 'spendingImports');

const BASE: AccountTargetFormValues = {
    mode: 'existing',
    accountId: 'acc-1',
    newAccountName: '',
    newAccountKind: 'checking',
    newAccountInstitution: ''
};

function messages(input: AccountTargetFormValues): string[] {
    const result: ReturnType<ReturnType<typeof createAccountTargetSchema>['safeParse']> = createAccountTargetSchema(t).safeParse(input);
    return result.success ? [] : result.error.issues.map((issue): string => `${issue.path.join('.')}: ${issue.message}`);
}

describe('createAccountTargetSchema', () => {
    it('conta existente exige a conta', () => {
        expect(messages(BASE)).toEqual([]);
        expect(messages({ ...BASE, accountId: '' })).toEqual(['accountId: Escolha a conta de destino']);
    });

    it('conta nova exige o nome', () => {
        expect(messages({ ...BASE, mode: 'new', accountId: '' })).toEqual(['newAccountName: Dê um nome para a conta']);
        expect(messages({ ...BASE, mode: 'new', accountId: '', newAccountName: '   ' })).toEqual([
            'newAccountName: Dê um nome para a conta'
        ]);
    });

    it('limita nome e instituição a 60 caracteres', () => {
        const long: string = 'x'.repeat(61);

        expect(messages({ ...BASE, mode: 'new', newAccountName: long, newAccountInstitution: long })).toEqual([
            'newAccountName: O nome pode ter até 60 caracteres',
            'newAccountInstitution: A instituição pode ter até 60 caracteres'
        ]);
    });
});

describe('defaultTargetValues', () => {
    const accounts: AccountView[] = [accountView({ id: 'acc-1' }), accountView({ id: 'acc-2' })];

    it('pré-seleciona a conta sugerida', () => {
        expect(defaultTargetValues(accounts, 'acc-2', 'Nubank')).toMatchObject({ mode: 'existing', accountId: 'acc-2' });
    });

    it('ignora uma sugestão que não está na lista', () => {
        expect(defaultTargetValues(accounts, 'acc-9', null).accountId).toBe('');
    });

    it('sem contas, vem em nova conta com o nome da instituição', () => {
        expect(defaultTargetValues([], null, 'Nubank')).toMatchObject({ mode: 'new', newAccountName: 'Nubank' });
        expect(defaultTargetValues([], null, null).newAccountName).toBe('');
    });
});

describe('toImportTarget', () => {
    it('existente leva só o id', () => {
        expect(toImportTarget(BASE)).toEqual({ accountId: 'acc-1' });
    });

    it('nova leva nome, tipo e instituição quando preenchida', () => {
        expect(toImportTarget({ ...BASE, mode: 'new', newAccountName: 'Reserva', newAccountKind: 'savings' })).toEqual({
            newAccountName: 'Reserva',
            newAccountKind: 'savings',
            newAccountInstitution: undefined
        });
        expect(toImportTarget({ ...BASE, mode: 'new', newAccountName: 'R', newAccountInstitution: 'Banco X' })).toMatchObject({
            newAccountInstitution: 'Banco X'
        });
    });
});

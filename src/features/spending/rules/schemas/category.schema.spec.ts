import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { i18n } from '@/shared/lib/i18n';
import { categoryNameSchema, createCategorySchema } from './category.schema';

const t: TFunction<'spendingRules'> = i18n.getFixedT('pt-BR', 'spendingRules');

function messages(input: object): string[] {
    const result: ReturnType<ReturnType<typeof createCategorySchema>['safeParse']> = createCategorySchema(t).safeParse(input);
    return result.success ? [] : result.error.issues.map((issue): string => issue.message);
}

describe('createCategorySchema', () => {
    it('aceita um gasto com flexibilidade', () => {
        expect(messages({ name: 'Pets', kind: 'expense', flexibility: 'flexible', icon: 'PawPrint' })).toEqual([]);
    });

    it('exige a flexibilidade para gasto', () => {
        expect(messages({ name: 'Pets', kind: 'expense', icon: 'PawPrint' })).toEqual(['Escolha entre fixo e flexível']);
    });

    it('não aceita flexibilidade para entrada', () => {
        expect(messages({ name: 'Freela', kind: 'income', flexibility: 'fixed', icon: 'Briefcase' })).toEqual([
            'Entradas não têm fixo ou flexível'
        ]);
        expect(messages({ name: 'Freela', kind: 'income', icon: 'Briefcase' })).toEqual([]);
    });

    it('recusa nome vazio, longo e ícone fora da lista', () => {
        expect(messages({ name: '  ', kind: 'income', icon: 'Briefcase' })).toEqual(['Informe um nome']);
        expect(messages({ name: 'x'.repeat(41), kind: 'income', icon: 'Briefcase' })).toEqual(['Use no máximo 40 caracteres']);
        expect(messages({ name: 'Ok', kind: 'income', icon: 'Rocket' })).toHaveLength(1);
        expect(messages({ name: 'Ok', kind: 'transfer', icon: 'Home' })).toHaveLength(1);
    });

    it('o esquema do nome sozinho apara os espaços', () => {
        expect(categoryNameSchema(t).parse('  Mercado ')).toBe('Mercado');
    });
});

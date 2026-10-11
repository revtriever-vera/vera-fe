import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { i18n } from '@/shared/lib/i18n';
import { defaultClasses } from '../../../../../test/fixtures/portfolio';
import { takenClassNames } from '../lib/class-name-rules';
import { createClassSchema } from './class.schema';

type SafeParse = ReturnType<ReturnType<typeof createClassSchema>['safeParse']>;

const TAKEN: readonly string[] = takenClassNames(defaultClasses().data, null);

function firstMessage(t: TFunction<'portfolioTargets'>, name: string): string | undefined {
    const result: SafeParse = createClassSchema(t, TAKEN).safeParse({ name, colorKey: 'c9' });
    return result.success ? undefined : result.error.issues[0]?.message;
}

describe('createClassSchema em português', () => {
    const t: TFunction<'portfolioTargets'> = i18n.getFixedT('pt-BR', 'portfolioTargets');

    it('aceita um nome válido e apara os espaços', () => {
        const result: SafeParse = createClassSchema(t, TAKEN).safeParse({ name: '  Previdência ', colorKey: 'c9' });

        expect(result).toEqual({ success: true, data: { name: 'Previdência', colorKey: 'c9' } });
    });

    it.each(['', '   '])('recusa nome vazio ou só com espaços (%j)', (name: string) => {
        expect(firstMessage(t, name)).toBe('Dê um nome à classe.');
    });

    it('recusa mais de 40 caracteres e aceita exatamente 40', () => {
        expect(firstMessage(t, 'a'.repeat(41))).toBe('Use até 40 caracteres.');
        expect(firstMessage(t, 'a'.repeat(40))).toBeUndefined();
    });

    it('recusa nome repetido com outra caixa', () => {
        expect(firstMessage(t, 'fiis')).toBe('Já existe uma classe com esse nome.');
    });

    it('recusa o nome padrão da classe em inglês', () => {
        expect(firstMessage(t, 'US Stocks')).toBe('Já existe uma classe com esse nome.');
    });

    it('recusa uma cor fora da paleta', () => {
        expect(createClassSchema(t, TAKEN).safeParse({ name: 'Nova', colorKey: 'c13' }).success).toBe(false);
    });
});

describe('createClassSchema em inglês', () => {
    const t: TFunction<'portfolioTargets'> = i18n.getFixedT('en', 'portfolioTargets');

    it('traduz as mensagens', () => {
        expect(firstMessage(t, '')).toBe('Give the class a name.');
        expect(firstMessage(t, 'ações brasil')).toBe('A class with this name already exists.');
        expect(firstMessage(t, 'Brazilian stocks')).toBe('A class with this name already exists.');
    });
});

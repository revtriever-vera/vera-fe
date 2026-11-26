import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { i18n } from '@/shared/lib/i18n';
import { noticeTitleList, noticeTypes } from './notice-text';

const ptBr: TFunction<'notices'> = i18n.getFixedT('pt-BR', 'notices');
const en: TFunction<'notices'> = i18n.getFixedT('en', 'notices');

describe('noticeTitleList', () => {
    it('devolve o nome de um tipo só', () => {
        expect(noticeTitleList(ptBr, 'pt-BR', 'recurring_week')).toBe('Débitos da semana');
    });

    it('junta vários tipos no idioma da tela', () => {
        expect(noticeTitleList(ptBr, 'pt-BR', 'recurring_week,goal_behind')).toBe('Débitos da semana e Objetivo atrasado');
        expect(noticeTitleList(en, 'en', 'recurring_week, goal_behind')).toBe('Debits of the week and Goal behind');
    });

    it('usa o texto genérico para tipo desconhecido e ignora repetidos', () => {
        expect(noticeTitleList(ptBr, 'pt-BR', 'novo_tipo,novo_tipo')).toBe('Outros avisos');
        expect(noticeTypes('a,,a, b')).toEqual(['a', 'b']);
    });
});

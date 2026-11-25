import { describe, expect, it } from 'vitest';
import { splitAnswer, splitParagraphs, type AnswerPart } from './answer-parts';

describe('splitAnswer', () => {
    it('separa texto, negrito e link interno', () => {
        const parts: readonly AnswerPart[] = splitAnswer('Veja **Onde aportar** em [Aportes](/portfolio/contribution) agora');
        expect(parts.map((part) => part.kind)).toEqual(['text', 'bold', 'text', 'link', 'text']);
        expect(parts[3]).toMatchObject({ text: 'Aportes', href: '/portfolio/contribution' });
    });

    it('não transforma link externo nem protocolo relativo em link', () => {
        const parts: readonly AnswerPart[] = splitAnswer('[a](https://example.com) [b](//example.com)');
        expect(parts.every((part) => part.kind === 'text')).toBe(true);
    });

    it('devolve o texto inteiro quando não há marcação', () => {
        expect(splitAnswer('sem marcação')).toEqual([{ kind: 'text', text: 'sem marcação', offset: 0 }]);
    });
});

describe('splitParagraphs', () => {
    it('quebra em linhas em branco e descarta vazios', () => {
        expect(splitParagraphs('um\n\n\ndois\n\n  ')).toEqual(['um', 'dois']);
    });
});

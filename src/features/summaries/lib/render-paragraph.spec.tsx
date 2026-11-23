import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderParagraph, splitParagraph } from './render-paragraph';

describe('splitParagraph', () => {
    it('separa o trecho em negrito do resto', () => {
        expect(splitParagraph('Faltam **R$ 1.640** por mês.')).toEqual([
            { bold: false, text: 'Faltam ', offset: 0 },
            { bold: true, text: 'R$ 1.640', offset: 7 },
            { bold: false, text: ' por mês.', offset: 19 }
        ]);
    });

    it('um texto sem marcação é uma parte só', () => {
        expect(splitParagraph('Sem números em destaque.')).toEqual([{ bold: false, text: 'Sem números em destaque.', offset: 0 }]);
    });

    it('asteriscos soltos continuam texto', () => {
        expect(splitParagraph('2 ** 3')).toEqual([{ bold: false, text: '2 ** 3', offset: 0 }]);
    });
});

describe('renderParagraph', () => {
    it('o negrito vira strong e HTML no texto aparece escapado', () => {
        const { container } = render(<p>{renderParagraph('Total **R$ 1.640** <script>alert(1)</script> <b>x</b>')}</p>);
        expect(screen.getByText('R$ 1.640').tagName).toBe('STRONG');
        expect(container.querySelector('script')).toBeNull();
        expect(container.querySelector('b')).toBeNull();
        expect(container.textContent).toContain('<script>alert(1)</script>');
    });
});

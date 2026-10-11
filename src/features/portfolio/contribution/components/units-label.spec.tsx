import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { i18n } from '@/shared/lib/i18n';
import { UnitsLabel } from './units-label';

describe('UnitsLabel', () => {
    it.each([
        ['acoes_br', '40', '≈ 40 cotas'],
        ['acoes_br', '1', '≈ 1 cota'],
        ['cripto', '0.0123', '≈ 0,0123 un.'],
        ['tesouro', '2.5', '≈ 2,5 títulos'],
        ['fii', '0', 'menos de 1 cota'],
        ['fixed_income', null, 'novo título ou reforço'],
        ['acoes_eua', null, 'preço indisponível']
    ])('%s com %s mostra "%s"', (typeGroup: string, approxUnits: string | null, text: string) => {
        render(<UnitsLabel typeGroup={typeGroup} approxUnits={approxUnits} />);

        expect(screen.getByText(text)).toBeInTheDocument();
    });

    it('em inglês usa shares e units', async () => {
        await i18n.changeLanguage('en');
        render(
            <>
                <UnitsLabel typeGroup="acoes_br" approxUnits="40" />
                <UnitsLabel typeGroup="cripto" approxUnits="0.0123" />
                <UnitsLabel typeGroup="fii" approxUnits="0" />
            </>
        );

        expect(screen.getByText('≈ 40 shares')).toBeInTheDocument();
        expect(screen.getByText('≈ 0.0123 units')).toBeInTheDocument();
        expect(screen.getByText('less than 1 share')).toBeInTheDocument();
    });
});

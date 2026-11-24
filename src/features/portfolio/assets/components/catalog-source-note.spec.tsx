import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../../../test/render';
import { CatalogSourceNote } from './catalog-source-note';

describe('CatalogSourceNote', () => {
    it('cita a CVM com link e a licença nos grupos do cadastro da CVM', () => {
        renderWithProviders(<CatalogSourceNote group="fii" />);

        const link: HTMLElement = screen.getByRole('link', { name: 'CVM, Portal de Dados Abertos' });
        expect(link).toHaveAttribute('href', 'https://dados.cvm.gov.br/');
        expect(screen.getByText(/licença ODbL/)).toBeInTheDocument();
    });

    it('não aparece em grupos que não vêm da CVM', () => {
        renderWithProviders(<CatalogSourceNote group="cripto" />);

        expect(screen.queryByText(/ODbL/)).not.toBeInTheDocument();
    });
});

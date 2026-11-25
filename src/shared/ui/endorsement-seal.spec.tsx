import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import i18n from 'i18next';
import { EndorsementSeal } from './endorsement-seal';

describe('EndorsementSeal', () => {
    it('links to Revtriever with the pt-BR text', () => {
        render(<EndorsementSeal />);

        const link: HTMLElement = screen.getByRole('link', { name: 'Vera, por Revtriever' });

        expect(link).toHaveAttribute('href', 'https://revtriever.com');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('uses the English text', async () => {
        await i18n.changeLanguage('en');
        render(<EndorsementSeal />);

        expect(screen.getByRole('link', { name: 'Vera, by Revtriever' })).toBeInTheDocument();

        await i18n.changeLanguage('pt-BR');
    });
});

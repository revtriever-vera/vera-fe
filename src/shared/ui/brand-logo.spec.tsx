import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrandLogo } from './brand-logo';

describe('BrandLogo', () => {
    it('mostra o nome da marca e esconde o desenho do leitor de tela', () => {
        const { container } = render(<BrandLogo />);

        expect(screen.getByText('vera')).toBeInTheDocument();
        expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    });
});

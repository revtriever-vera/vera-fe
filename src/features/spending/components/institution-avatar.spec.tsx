import { afterEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { i18n } from '@/shared/lib/i18n';
import { InstitutionAvatar } from './institution-avatar';

const LOGO: string = 'https://logos.example.test/nubank.png';

afterEach(async () => {
    await i18n.changeLanguage('pt-BR');
});

describe('InstitutionAvatar', () => {
    it('mostra a logo com alt traduzido e atributos de privacidade', () => {
        render(<InstitutionAvatar name="Nubank" logoUrl={LOGO} />);

        const image: HTMLElement = screen.getByRole('img', { name: 'Logo de Nubank' });
        expect(image).toHaveAttribute('src', LOGO);
        expect(image).toHaveAttribute('loading', 'lazy');
        expect(image).toHaveAttribute('referrerpolicy', 'no-referrer');
        expect(screen.queryByText('Nu')).not.toBeInTheDocument();
    });

    it('traduz o alt para inglês', async () => {
        await i18n.changeLanguage('en');
        render(<InstitutionAvatar name="Nubank" logoUrl={LOGO} />);

        expect(screen.getByRole('img', { name: 'Logo of Nubank' })).toBeInTheDocument();
    });

    it('usa um nome genérico quando o banco não tem nome', async () => {
        await i18n.changeLanguage('en');
        render(<InstitutionAvatar name={null} logoUrl={LOGO} />);

        expect(screen.getByRole('img', { name: 'Logo of the bank' })).toBeInTheDocument();
    });

    it('cai nas iniciais quando não há logo', () => {
        render(<InstitutionAvatar name="Banco Inter" logoUrl={null} />);

        expect(screen.getByText('BI')).toBeInTheDocument();
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('cai nas iniciais quando a logo não carrega', () => {
        render(<InstitutionAvatar name="Nubank" logoUrl={LOGO} />);

        fireEvent.error(screen.getByRole('img'));

        expect(screen.getByText('Nu')).toBeInTheDocument();
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('tenta de novo quando a URL da logo muda depois de uma falha', () => {
        const { rerender } = render(<InstitutionAvatar name="Nubank" logoUrl={LOGO} />);
        fireEvent.error(screen.getByRole('img'));

        rerender(<InstitutionAvatar name="Nubank" logoUrl="https://logos.example.test/nubank-v2.png" size="sm" />);

        expect(screen.getByRole('img')).toHaveAttribute('src', 'https://logos.example.test/nubank-v2.png');
    });
});

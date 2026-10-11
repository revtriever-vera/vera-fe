import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { i18n } from '@/shared/lib/i18n';
import { categoryView, systemCategory } from '../../../../test/fixtures/spending';
import { CategoryName } from './category-name';

describe('CategoryName', () => {
    it('traduz a categoria padrão pela chave', () => {
        render(<CategoryName category={systemCategory('home_services')} />);

        expect(screen.getByText('Casa e serviços')).toBeInTheDocument();
    });

    it('mostra o nome do usuário sem tradução', () => {
        render(<CategoryName category={categoryView({ name: 'Pets' })} />);

        expect(screen.getByText('Pets')).toBeInTheDocument();
    });

    it('sem categoria mostra o texto traduzido', () => {
        render(<CategoryName category={null} />);

        expect(screen.getByText('Sem categoria')).toBeInTheDocument();
    });

    it('usa um nome genérico para chave desconhecida sem nome', () => {
        render(<CategoryName category={categoryView({ name: null, systemKey: 'inventada' })} />);

        expect(screen.getByText('Categoria')).toBeInTheDocument();
    });

    it('segue o idioma ativo', async () => {
        await i18n.changeLanguage('en');
        render(<CategoryName category={systemCategory('eating_out')} />);

        expect(screen.getByText('Delivery and restaurants')).toBeInTheDocument();
        await i18n.changeLanguage('pt-BR');
    });
});

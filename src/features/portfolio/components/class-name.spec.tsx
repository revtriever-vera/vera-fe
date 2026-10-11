import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { i18n } from '@/shared/lib/i18n';
import { ClassName } from './class-name';

describe('ClassName', () => {
    it('mostra o nome que o usuário deu, sem traduzir', () => {
        render(<ClassName systemKey={null} name="Renda fixa pós" />);

        expect(screen.getByText('Renda fixa pós')).toBeInTheDocument();
    });

    it('mostra o nome do usuário mesmo em classe padrão renomeada', () => {
        render(<ClassName systemKey="fii" name="Meus fundos" />);

        expect(screen.getByText('Meus fundos')).toBeInTheDocument();
    });

    it('classe padrão sem nome usa a tradução pela chave', () => {
        render(<ClassName systemKey="acoes_eua" name={null} />);

        expect(screen.getByText('Ações EUA')).toBeInTheDocument();
    });

    it('acompanha o idioma', async () => {
        await i18n.changeLanguage('en');
        render(<ClassName systemKey="acoes_eua" name={null} />);

        expect(screen.getByText('US stocks')).toBeInTheDocument();
    });

    it('classe sem nome e sem chave conhecida usa o nome genérico', () => {
        render(<ClassName systemKey="inexistente" name={null} />);

        expect(screen.getByText('Classe sem nome')).toBeInTheDocument();
    });
});

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { i18n } from '@/shared/lib/i18n';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { CategorySource } from '../types';
import { CategorySourceBadge } from './category-source-badge';

describe('CategorySourceBadge', () => {
    it.each<[CategorySource, string]>([
        ['user', 'você corrigiu'],
        ['rule', 'por sua regra'],
        ['dictionary', 'por dicionário'],
        ['provider', 'pela Pluggy']
    ])('mostra o texto curto de %s', (source: CategorySource, text: string) => {
        render(<CategorySourceBadge source={source} />);

        expect(screen.getByRole('button', { name: text })).toBeInTheDocument();
    });

    it('explica a origem da Pluggy nos dois idiomas', async () => {
        const user: UserEvent = userEvent.setup();
        await i18n.changeLanguage('en');
        render(<CategorySourceBadge source="provider" />);

        await user.tab();

        expect(screen.getByRole('button', { name: 'from Pluggy' })).toBeInTheDocument();
        expect((await screen.findAllByRole('tooltip'))[0]).toHaveTextContent(
            'This category came from Pluggy itself, which reads the bank.'
        );
        await i18n.changeLanguage('pt-BR');
    });

    it('não mostra nada quando não há categoria', () => {
        const { container } = render(<CategorySourceBadge source="none" />);

        expect(container).toBeEmptyDOMElement();
    });

    it('explica a origem no balão ao focar', async () => {
        const user: UserEvent = userEvent.setup();
        render(<CategorySourceBadge source="dictionary" />);

        await user.tab();

        const tips: HTMLElement[] = await screen.findAllByRole('tooltip');
        expect(tips[0]).toHaveTextContent('Esta categoria veio do dicionário de estabelecimentos da Vera.');
    });
});

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
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

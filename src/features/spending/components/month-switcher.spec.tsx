import { describe, expect, it, vi, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { i18n } from '@/shared/lib/i18n';
import { MonthSwitcher, type MonthSwitcherProps } from './month-switcher';

function props(overrides: Partial<MonthSwitcherProps> = {}): MonthSwitcherProps {
    return { month: '2026-09', previousMonth: '2026-08', nextMonth: '2026-10', isPartial: false, onChange: vi.fn(), ...overrides };
}

describe('MonthSwitcher', () => {
    it('mostra o mês por extenso com a inicial maiúscula', () => {
        render(<MonthSwitcher {...props()} />);

        expect(screen.getByText('Setembro de 2026')).toBeInTheDocument();
        expect(screen.getByRole('group', { name: 'Mês' })).toBeInTheDocument();
    });

    it('as setas têm nome acessível e chamam onChange com o mês vizinho', async () => {
        const user: UserEvent = userEvent.setup();
        const onChange: Mock = vi.fn();
        render(<MonthSwitcher {...props({ onChange })} />);

        await user.click(screen.getByRole('button', { name: 'Mês anterior' }));
        await user.click(screen.getByRole('button', { name: 'Próximo mês' }));

        expect(onChange).toHaveBeenNthCalledWith(1, '2026-08');
        expect(onChange).toHaveBeenNthCalledWith(2, '2026-10');
    });

    it('desabilita a seta sem vizinho', () => {
        render(<MonthSwitcher {...props({ previousMonth: null, nextMonth: null })} />);

        expect(screen.getByRole('button', { name: 'Mês anterior' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Próximo mês' })).toBeDisabled();
    });

    it('mostra o selo quando o mês está em andamento', () => {
        render(<MonthSwitcher {...props({ month: '2026-10', isPartial: true })} />);

        expect(screen.getByText('mês em andamento')).toBeInTheDocument();
    });

    it('não mostra o selo num mês fechado', () => {
        render(<MonthSwitcher {...props()} />);

        expect(screen.queryByText('mês em andamento')).not.toBeInTheDocument();
    });

    it('segue o idioma', async () => {
        await i18n.changeLanguage('en');
        render(<MonthSwitcher {...props()} />);

        expect(screen.getByText('September 2026')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Previous month' })).toBeInTheDocument();
        await i18n.changeLanguage('pt-BR');
    });
});

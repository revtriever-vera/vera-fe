import { useState, type ReactElement } from 'react';
import { describe, expect, it, vi, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { SegmentedControl } from './segmented-control';

type Currency = 'BRL' | 'USD';

const OPTIONS: readonly { value: Currency; label: string }[] = [
    { value: 'BRL', label: 'R$' },
    { value: 'USD', label: 'US$' }
];

function Harness({
    onChange,
    disabled = false
}: {
    readonly onChange: (value: Currency) => void;
    readonly disabled?: boolean;
}): ReactElement {
    const [value, setValue] = useState<Currency>('BRL');
    return (
        <SegmentedControl
            label="Moeda"
            options={OPTIONS}
            value={value}
            disabled={disabled}
            onChange={(next: Currency): void => {
                setValue(next);
                onChange(next);
            }}
        />
    );
}

describe('SegmentedControl', () => {
    it('marca a opção atual', () => {
        render(<Harness onChange={vi.fn()} />);

        expect(screen.getByRole('radio', { name: 'R$' })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'US$' })).not.toBeChecked();
    });

    it('troca de opção ao clicar e avisa quem usa', async () => {
        const user: UserEvent = userEvent.setup();
        const onChange: Mock<(value: Currency) => void> = vi.fn();
        render(<Harness onChange={onChange} />);

        await user.click(screen.getByRole('radio', { name: 'US$' }));

        expect(onChange).toHaveBeenCalledWith('USD');
        expect(screen.getByRole('radio', { name: 'US$' })).toBeChecked();
    });

    it('clicar na opção atual não desmarca nem avisa', async () => {
        const user: UserEvent = userEvent.setup();
        const onChange: Mock<(value: Currency) => void> = vi.fn();
        render(<Harness onChange={onChange} />);

        await user.click(screen.getByRole('radio', { name: 'R$' }));

        expect(onChange).not.toHaveBeenCalled();
        expect(screen.getByRole('radio', { name: 'R$' })).toBeChecked();
    });

    it('navega pelas setas do teclado', async () => {
        const user: UserEvent = userEvent.setup();
        const onChange: Mock<(value: Currency) => void> = vi.fn();
        render(<Harness onChange={onChange} />);

        await user.tab();
        await user.keyboard('{ArrowRight}{Enter}');

        expect(onChange).toHaveBeenCalledWith('USD');
    });

    it('não responde quando desabilitado', async () => {
        const user: UserEvent = userEvent.setup();
        const onChange: Mock<(value: Currency) => void> = vi.fn();
        render(<Harness onChange={onChange} disabled />);

        await user.click(screen.getByRole('radio', { name: 'US$' }));

        expect(onChange).not.toHaveBeenCalled();
    });

    it('expõe o rótulo do grupo', () => {
        render(<Harness onChange={vi.fn()} />);

        expect(screen.getByRole('radiogroup', { name: 'Moeda' })).toBeInTheDocument();
    });
});

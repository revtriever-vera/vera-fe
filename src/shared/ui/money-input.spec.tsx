import { useState, type ReactElement } from 'react';
import { describe, expect, it, vi, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { MoneyInput } from './money-input';

function Harness({
    initial,
    currency = 'BRL',
    onValue
}: {
    initial: number | null;
    currency?: string;
    onValue?: (v: number | null) => void;
}): ReactElement {
    const [value, setValue] = useState<number | null>(initial);
    return (
        <>
            <MoneyInput
                label="Valor aplicado"
                value={value}
                currency={currency}
                hint="Dica"
                onChange={(next: number | null): void => {
                    setValue(next);
                    onValue?.(next);
                }}
            />
            <button
                type="button"
                onClick={(): void => {
                    setValue(123456);
                }}
            >
                preencher
            </button>
        </>
    );
}

describe('MoneyInput', () => {
    it('entrega o valor em unidades menores enquanto a pessoa digita', async () => {
        const user: UserEvent = userEvent.setup();
        const onValue: Mock = vi.fn();
        render(<Harness initial={null} onValue={onValue} />);

        await user.type(screen.getByLabelText('Valor aplicado'), '50000');

        expect(onValue).toHaveBeenLastCalledWith(5000000);
        expect(screen.getByText('R$')).toBeInTheDocument();
        expect(screen.getByText('Dica')).toBeInTheDocument();
    });

    it('formata ao sair do campo e aceita vírgula decimal', async () => {
        const user: UserEvent = userEvent.setup();
        render(<Harness initial={null} />);
        const input: HTMLElement = screen.getByLabelText('Valor aplicado');

        await user.type(input, '1500,5');
        await user.tab();

        expect(input).toHaveValue('1.500,50');
    });

    it('ignora letras e devolve nulo quando esvazia', async () => {
        const user: UserEvent = userEvent.setup();
        const onValue: Mock = vi.fn();
        render(<Harness initial={100} onValue={onValue} />);
        const input: HTMLElement = screen.getByLabelText('Valor aplicado');

        await user.clear(input);
        await user.type(input, 'abc');

        expect(input).toHaveValue('');
        expect(onValue).toHaveBeenLastCalledWith(null);
    });

    it('acompanha mudança externa do valor', async () => {
        const user: UserEvent = userEvent.setup();
        render(<Harness initial={null} />);

        await user.click(screen.getByRole('button', { name: 'preencher' }));

        expect(screen.getByLabelText('Valor aplicado')).toHaveValue('1.234,56');
    });

    it('mostra o erro ligado ao campo e o símbolo da moeda', () => {
        render(<MoneyInput label="Valor" value={null} currency="USD" error="Obrigatório" onChange={vi.fn()} />);

        expect(screen.getByLabelText('Valor')).toHaveAccessibleDescription('Obrigatório');
        expect(screen.getByLabelText('Valor')).toBeInvalid();
        expect(screen.getByText('US$')).toBeInTheDocument();
    });
});

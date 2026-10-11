import { useState, type ReactElement } from 'react';
import { describe, expect, it, vi, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { PercentStepper } from './percent-stepper';

interface HarnessProps {
    readonly initial: number;
    readonly onCommit?: (bps: number) => void;
    readonly max?: number;
    readonly error?: string;
}

function Harness({ initial, onCommit, max = 10000, error }: HarnessProps): ReactElement {
    const [value, setValue] = useState<number>(initial);
    return (
        <PercentStepper
            value={value}
            onChange={setValue}
            onCommit={onCommit}
            stepBps={100}
            minBps={0}
            maxBps={max}
            inputLabel="Campo"
            decreaseLabel="Menos"
            increaseLabel="Mais"
            error={error}
        />
    );
}

describe('PercentStepper', () => {
    it('mostra o valor e anda de um em um ponto', async () => {
        const user: UserEvent = userEvent.setup();
        const onCommit: Mock = vi.fn();
        render(<Harness initial={2500} onCommit={onCommit} />);

        await user.click(screen.getByRole('button', { name: 'Mais' }));
        await user.click(screen.getByRole('button', { name: 'Menos' }));
        await user.click(screen.getByRole('button', { name: 'Menos' }));

        expect(screen.getByRole('textbox', { name: 'Campo' })).toHaveValue('24');
        expect(onCommit.mock.calls).toEqual([[2600], [2500], [2400]]);
    });

    it('aceita vírgula e ponto com até duas casas', async () => {
        const user: UserEvent = userEvent.setup();
        const onCommit: Mock = vi.fn();
        render(<Harness initial={0} onCommit={onCommit} />);
        const input: HTMLElement = screen.getByRole('textbox', { name: 'Campo' });

        await user.clear(input);
        await user.type(input, '33,33');
        await user.tab();
        await user.clear(input);
        await user.type(input, '12.5');
        await user.tab();

        expect(onCommit.mock.calls).toEqual([[3333], [1250]]);
        expect(input).toHaveValue('12,5');
    });

    it('trava os botões nos limites', () => {
        render(<Harness initial={0} />);

        expect(screen.getByRole('button', { name: 'Menos' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Mais' })).toBeEnabled();
    });

    it('não confirma texto fora do limite ou inválido e marca o erro', async () => {
        const user: UserEvent = userEvent.setup();
        const onCommit: Mock = vi.fn();
        render(<Harness initial={500} onCommit={onCommit} max={2000} error="Erro do campo" />);
        const input: HTMLElement = screen.getByRole('textbox', { name: 'Campo' });

        await user.clear(input);
        await user.type(input, '21');
        await user.tab();

        expect(onCommit).not.toHaveBeenCalled();
        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByRole('alert')).toHaveTextContent('Erro do campo');
        expect(input).toHaveValue('21');
    });

    it('sai do estado inválido quando o passo é usado', async () => {
        const user: UserEvent = userEvent.setup();
        render(<Harness initial={500} />);
        const input: HTMLElement = screen.getByRole('textbox', { name: 'Campo' });

        await user.clear(input);
        await user.type(input, 'abc');
        await user.click(screen.getByRole('button', { name: 'Mais' }));

        expect(input).toHaveValue('1');
    });
});

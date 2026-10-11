import { afterEach, describe, expect, it, vi, type Mock } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ToastStack } from './toast';
import type { Toast } from './toast.types';

const POSITIVE: Toast = { id: 'toast-1', tone: 'positive', title: 'Verificação fechou', detail: 'Tudo certo por aqui.', durationMs: 3200 };
const CRITICAL: Toast = { id: 'toast-2', tone: 'critical', title: 'Não consegui verificar', detail: null, durationMs: 0 };
const NEUTRAL: Toast = { id: 'toast-3', tone: 'neutral', title: 'Aviso geral', detail: null, durationMs: 4000 };

function advance(ms: number): void {
    act((): void => {
        vi.advanceTimersByTime(ms);
    });
}

describe('ToastStack', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('não ocupa espaço quando não há avisos', () => {
        const { container }: { container: HTMLElement } = render(<ToastStack toasts={[]} onDismiss={vi.fn()} />);

        expect(container).toBeEmptyDOMElement();
    });

    it('mostra título e detalhe de cada aviso', () => {
        render(<ToastStack toasts={[POSITIVE, CRITICAL]} onDismiss={vi.fn()} />);

        expect(screen.getByText('Verificação fechou')).toBeInTheDocument();
        expect(screen.getByText('Tudo certo por aqui.')).toBeInTheDocument();
        expect(screen.getByText('Não consegui verificar')).toBeInTheDocument();
    });

    it('anuncia o aviso crítico como alerta e o resto como status', () => {
        render(<ToastStack toasts={[POSITIVE, CRITICAL]} onDismiss={vi.fn()} />);

        expect(screen.getByRole('alert')).toHaveTextContent('Não consegui verificar');
        expect(screen.getByRole('status')).toHaveTextContent('Verificação fechou');
    });

    it('devolve o id do aviso que o usuário fecha', () => {
        vi.useFakeTimers();
        const onDismiss: Mock = vi.fn();
        render(<ToastStack toasts={[POSITIVE]} onDismiss={onDismiss} />);

        fireEvent.click(screen.getByRole('button', { name: 'Fechar aviso' }));
        advance(200);

        expect(onDismiss).toHaveBeenCalledExactlyOnceWith('toast-1');
    });

    it('devolve o id sozinho quando o tempo de leitura acaba', () => {
        vi.useFakeTimers();
        const onDismiss: Mock = vi.fn();
        render(<ToastStack toasts={[POSITIVE]} onDismiss={onDismiss} />);

        advance(3200);
        expect(onDismiss).not.toHaveBeenCalled();

        advance(140);
        expect(onDismiss).toHaveBeenCalledExactlyOnceWith('toast-1');
    });

    it('segura o tempo enquanto o mouse está sobre o aviso', () => {
        vi.useFakeTimers();
        const onDismiss: Mock = vi.fn();
        render(<ToastStack toasts={[POSITIVE]} onDismiss={onDismiss} />);

        fireEvent.mouseEnter(screen.getByRole('status'));
        advance(10000);

        expect(onDismiss).not.toHaveBeenCalled();

        fireEvent.mouseLeave(screen.getByRole('status'));
        advance(3400);
        advance(200);

        expect(onDismiss).toHaveBeenCalledExactlyOnceWith('toast-1');
    });

    it('não fecha sozinho o aviso sem tempo de vida', () => {
        vi.useFakeTimers();
        const onDismiss: Mock = vi.fn();
        render(<ToastStack toasts={[CRITICAL]} onDismiss={onDismiss} />);

        advance(60000);

        expect(onDismiss).not.toHaveBeenCalled();
    });

    it('marca o aviso neutro com o ícone de informação', () => {
        render(<ToastStack toasts={[NEUTRAL]} onDismiss={vi.fn()} />);

        expect(screen.getByText('Aviso geral')).toBeInTheDocument();
    });

    it('só desenha a barra de tempo em quem some sozinho', () => {
        render(<ToastStack toasts={[POSITIVE, CRITICAL]} onDismiss={vi.fn()} />);

        const bars: HTMLElement[] = screen.getAllByTestId('toast-life');

        expect(bars).toHaveLength(1);
        expect(bars[0]).toHaveStyle({ animationDuration: '3200ms' });
    });
});

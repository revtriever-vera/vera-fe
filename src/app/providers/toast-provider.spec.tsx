import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import type { ToastRequest } from '@/shared/ui/toast.types';
import { ToastProvider, useToast, type ToastApi } from './toast-provider';

const SUCCESS: ToastRequest = { tone: 'positive', title: 'Código enviado', detail: 'Confira sua caixa de entrada.' };

function Trigger({ request }: { readonly request: ToastRequest }): ReactElement {
    const toast: ToastApi = useToast();
    return (
        <button
            type="button"
            onClick={(): void => {
                toast.show(request);
            }}
        >
            avisar
        </button>
    );
}

function renderTrigger(request: ToastRequest = SUCCESS): void {
    render(
        <ToastProvider>
            <Trigger request={request} />
        </ToastProvider>
    );
}

function fire(times: number = 1): void {
    for (let index: number = 0; index < times; index += 1) {
        fireEvent.click(screen.getByRole('button', { name: 'avisar' }));
    }
}

function advance(ms: number): void {
    act((): void => {
        vi.advanceTimersByTime(ms);
    });
}

describe('ToastProvider', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('mostra o aviso pedido por quem consome o contexto', () => {
        renderTrigger();

        fire();

        expect(screen.getByText('Código enviado')).toBeInTheDocument();
    });

    it('empilha avisos sem sobrescrever o anterior', () => {
        renderTrigger();

        fire(2);

        expect(screen.getAllByText('Código enviado')).toHaveLength(2);
    });

    it('guarda no máximo três avisos na tela', () => {
        renderTrigger();

        fire(5);

        expect(screen.getAllByText('Código enviado')).toHaveLength(3);
    });

    it('some sozinho depois do tempo de leitura do tom', () => {
        vi.useFakeTimers();
        renderTrigger();

        fire();
        advance(3000);
        expect(screen.getByText('Código enviado')).toBeInTheDocument();

        advance(400);
        advance(200);

        expect(screen.queryByText('Código enviado')).not.toBeInTheDocument();
    });

    it('deixa o aviso crítico na tela até alguém fechar', () => {
        vi.useFakeTimers();
        renderTrigger({ tone: 'critical', title: 'Não deu para entrar' });

        fire();
        advance(60000);

        expect(screen.getByText('Não deu para entrar')).toBeInTheDocument();
    });

    it('some na hora quando o usuário fecha', () => {
        vi.useFakeTimers();
        renderTrigger();
        fire();

        fireEvent.click(screen.getByRole('button', { name: 'Fechar aviso' }));
        advance(200);

        expect(screen.queryByText('Código enviado')).not.toBeInTheDocument();
    });

    it('acusa quem usa o hook fora do provedor', () => {
        expect((): unknown => renderHook(() => useToast())).toThrow('useToast must be used inside ToastProvider');
    });
});

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { STATUS_LEVELS, StatusDot } from './status-dot';

describe('StatusDot', () => {
    it('não renderiza nada sem nível', () => {
        const { container }: { container: HTMLElement } = render(<StatusDot level={null} message="Tudo certo" />);

        expect(container).toBeEmptyDOMElement();
    });

    it('marca bloqueio com o ícone de alerta', () => {
        render(<StatusDot level={STATUS_LEVELS.blocking} message="Falta configurar" />);

        expect(screen.getByLabelText('Falta configurar')).toBeInTheDocument();
    });

    it('marca concluído com o ícone de check', () => {
        render(<StatusDot level={STATUS_LEVELS.done} message="Pronto" />);

        expect(screen.getByLabelText('Pronto')).toBeInTheDocument();
    });

    it('marca melhorável com um ponto', () => {
        render(<StatusDot level={STATUS_LEVELS.improvable} message="Pode melhorar" />);

        expect(screen.getByRole('img', { name: 'Pode melhorar' })).toBeInTheDocument();
    });
});

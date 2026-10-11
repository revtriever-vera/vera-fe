import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stepper } from './stepper';

const STEPS: readonly { label: string }[] = [{ label: 'Conectar conta' }, { label: 'Importar carteira' }, { label: 'Revisar' }];

describe('Stepper', () => {
    it('marca o passo ativo e os concluídos antes dele', () => {
        render(<Stepper label="Onboarding" steps={STEPS} activeIndex={1} />);

        expect(screen.getByText('Importar carteira').previousSibling).toHaveAttribute('aria-current', 'step');
        expect(screen.getAllByText(/^\d$/)).toHaveLength(2);
    });

    it('mostra um passo por item, na ordem recebida', () => {
        render(<Stepper label="Onboarding" steps={STEPS} activeIndex={0} />);

        expect(screen.getByText('Conectar conta')).toBeInTheDocument();
        expect(screen.getByText('Importar carteira')).toBeInTheDocument();
        expect(screen.getByText('Revisar')).toBeInTheDocument();
    });
});

describe('Stepper com passo pulado', () => {
    it('marca o passo pulado com traço, sem número nem check, e risca o rótulo', () => {
        render(
            <Stepper label="Onboarding" steps={[{ label: 'Um' }, { label: 'Dois', skipped: true }, { label: 'Três' }]} activeIndex={2} />
        );

        expect(screen.getByText('–')).toBeInTheDocument();
        expect(screen.getByText('Dois')).toHaveClass('line-through');
        expect(screen.getByText('Um')).not.toHaveClass('line-through');
        expect(screen.queryByText('2')).not.toBeInTheDocument();
    });

    it('mantém o passo ativo mesmo que esteja marcado como pulado', () => {
        render(<Stepper label="Onboarding" steps={[{ label: 'Um', skipped: true }, { label: 'Dois' }]} activeIndex={0} />);

        expect(screen.getByText('Um').previousSibling).toHaveAttribute('aria-current', 'step');
        expect(screen.queryByText('–')).not.toBeInTheDocument();
    });

    it('mostra o passo pulado à frente do ativo como pulado', () => {
        render(<Stepper label="Onboarding" steps={[{ label: 'Um' }, { label: 'Dois', skipped: true }]} activeIndex={0} />);

        expect(screen.getByText('–')).toBeInTheDocument();
    });
});

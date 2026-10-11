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

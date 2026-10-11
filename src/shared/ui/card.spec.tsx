import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './card';

describe('Card', () => {
    it('nasce com a variante default', () => {
        render(<Card data-testid="card">conteúdo</Card>);

        expect(screen.getByTestId('card')).toHaveClass('bg-surface', 'shadow-card');
    });

    it('aceita a variante muted', () => {
        render(
            <Card data-testid="card" variant="muted">
                conteúdo
            </Card>
        );

        expect(screen.getByTestId('card')).toHaveClass('bg-surface-muted');
        expect(screen.getByTestId('card')).not.toHaveClass('shadow-card');
    });
});

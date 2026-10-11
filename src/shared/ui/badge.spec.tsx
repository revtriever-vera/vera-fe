import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge', () => {
    it('nasce com o tom neutro', () => {
        render(<Badge>Rascunho</Badge>);

        expect(screen.getByText('Rascunho')).toHaveClass('bg-surface-muted', 'text-content-muted');
    });

    it('aceita os outros tons semânticos', () => {
        render(<Badge tone="critical">Falhou</Badge>);

        expect(screen.getByText('Falhou')).toHaveClass('bg-critical/10', 'text-critical');
    });
});

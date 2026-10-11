import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TargetsTotalChip } from './targets-total-chip';

describe('TargetsTotalChip', () => {
    it.each([
        [10000, 'Total: 100%'],
        [9800, 'Total: 98% (faltam 2 pp)'],
        [10300, 'Total: 103% (tire 3 pp)'],
        [9950, 'Total: 99,5% (faltam 0,5 pp)']
    ])('soma %i mostra "%s"', (sum: number, text: string) => {
        render(<TargetsTotalChip sumBps={sum} />);

        expect(screen.getByRole('status')).toHaveTextContent(text);
    });
});

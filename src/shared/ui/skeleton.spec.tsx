import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loading, SkeletonText } from './skeleton';

describe('esqueletos', () => {
    it('anuncia o que está carregando, para quem não vê a animação', () => {
        render(
            <Loading label="Carregando ativos">
                <SkeletonText lines={2} />
            </Loading>
        );

        expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
        expect(screen.getByText('Carregando ativos')).toBeInTheDocument();
    });
});

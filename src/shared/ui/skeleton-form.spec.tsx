import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkeletonForm, SkeletonPanel } from './skeleton-form';

describe('SkeletonForm', () => {
    it('anuncia o rótulo e desenha um campo por linha', () => {
        const { container } = render(<SkeletonForm label="Carregando formulário" fields={2} />);

        expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
        expect(screen.getByText('Carregando formulário')).toBeInTheDocument();
        expect(container.querySelectorAll('.animate-pulse')).toHaveLength(5);
    });

    it('omite a ação quando pedido', () => {
        const { container } = render(<SkeletonForm label="Carregando" fields={1} withAction={false} />);

        expect(container.querySelectorAll('.animate-pulse')).toHaveLength(2);
    });
});

describe('SkeletonPanel', () => {
    it('desenha as linhas e as ações quando pedidas', () => {
        render(<SkeletonPanel label="Carregando painel" lines={2} withActions />);

        expect(screen.getByText('Carregando painel')).toBeInTheDocument();
    });

    it('omite as ações por padrão', () => {
        const { container } = render(<SkeletonPanel label="Carregando painel" lines={1} />);

        expect(container.querySelectorAll('.animate-pulse')).toHaveLength(5);
    });
});

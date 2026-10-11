import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderInRouter, sampleControls } from '../../../../test/helpers/render-in-router';
import { SpendingEmptyState } from './spending-empty-state';

describe('SpendingEmptyState', () => {
    it('explica o estado vazio e oferece as três ações', async () => {
        renderInRouter(<SpendingEmptyState />, { sample: sampleControls() });

        expect(await screen.findByRole('heading', { name: 'Nenhum gasto por aqui ainda' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Conectar bancos' })).toHaveAttribute('href', '/spending/connections');
        expect(screen.getByRole('link', { name: 'Importar extrato' })).toHaveAttribute('href', '/spending/connections?import=true');
        expect(screen.getByRole('button', { name: 'Explorar com dados de exemplo' })).toBeInTheDocument();
    });

    it('esconde os dados de exemplo quando já estão ativos', async () => {
        renderInRouter(<SpendingEmptyState />, { sample: sampleControls({ active: true }) });

        await screen.findByRole('heading', { name: 'Nenhum gasto por aqui ainda' });

        expect(screen.queryByRole('button', { name: 'Explorar com dados de exemplo' })).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Conectar bancos' })).toBeInTheDocument();
    });
});

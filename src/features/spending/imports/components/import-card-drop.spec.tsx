import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { emptyImports } from '../../../../../test/fixtures/spending';
import { mockImportApi, type ImportApi } from '../../../../../test/helpers/import-modal';
import { statementFile, stubNodeMultipart } from '../../../../../test/helpers/node-multipart';
import { renderInRouter } from '../../../../../test/helpers/render-in-router';
import { server } from '../../../../../test/msw/server';
import { ImportCard } from './import-card';

function mockList(): void {
    server.use(http.get('*/spending/imports', () => HttpResponse.json(emptyImports())));
}

beforeEach(async () => {
    await stubNodeMultipart();
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('ImportCard: área de soltar', () => {
    it('soltar um extrato na área do cartão abre o modal e lê o arquivo', async () => {
        const user: UserEvent = userEvent.setup();
        mockList();
        const api: ImportApi = mockImportApi();
        renderInRouter(<ImportCard />);

        expect(await screen.findByText('Arraste o extrato aqui')).toBeInTheDocument();
        expect(screen.getByText('OFX ou CSV, até 5 MB')).toBeInTheDocument();
        await user.upload(screen.getByLabelText('Arquivo do extrato'), statementFile('OFXHEADER:100', 'setembro.ofx'));

        expect(await screen.findByRole('dialog', { name: 'Importar extrato' })).toBeInTheDocument();
        await waitFor(() => {
            expect(api.previews).toHaveLength(1);
        });
        expect(await screen.findByText('setembro.ofx')).toBeInTheDocument();
    });

    it('recusa um arquivo que não é OFX nem CSV, sem abrir o modal', async () => {
        const user: UserEvent = userEvent.setup({ applyAccept: false });
        mockList();
        renderInRouter(<ImportCard />);

        await user.upload(await screen.findByLabelText('Arquivo do extrato'), statementFile('%PDF', 'extrato.pdf', 'application/pdf'));

        expect(await screen.findByText('Use um arquivo OFX ou CSV')).toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});

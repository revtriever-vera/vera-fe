import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { chooseReport, renderInvestmentImportModal, type InvestmentImportSetup } from '../../../../../test/helpers/investment-import-modal';
import { stubNodeMultipart } from '../../../../../test/helpers/node-multipart';
import { investmentPreview, previewLine } from '../../../../../test/fixtures/investment-imports';
import type { InvestmentPreview } from '../types';

const PDF: string = 'application/pdf';

beforeEach(async () => {
    await stubNodeMultipart();
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('InvestmentImportModal: leitura por modelo', () => {
    it('nota em PDF pede a confirmação, "Enviar" reenvia com modelConsent e segue até a conclusão', async () => {
        const preview: InvestmentPreview = investmentPreview({ source: 'model', documentType: 'note' });
        const { user, api }: InvestmentImportSetup = renderInvestmentImportModal({ preview, requireConsent: true });

        await chooseReport(user, 'nota.pdf', PDF);

        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'Enviar este arquivo?' });
        expect(within(dialog).getByText('Este arquivo é enviado a um modelo de linguagem, por um serviço da Vercel.')).toBeInTheDocument();
        expect(within(dialog).queryByRole('checkbox')).not.toBeInTheDocument();
        await user.click(within(dialog).getByRole('button', { name: 'Enviar' }));

        expect(await screen.findByRole('heading', { name: 'Confira as operações' })).toBeInTheDocument();
        expect(api.previews.map((request) => request.fields['modelConsent'])).toEqual([undefined, 'true']);
        await user.click(screen.getByRole('button', { name: 'Confirmar importação' }));
        expect(await screen.findByText('Importação concluída')).toBeInTheDocument();
    });

    it('"Cancelar" não faz segunda requisição e limpa o arquivo', async () => {
        const { user, api }: InvestmentImportSetup = renderInvestmentImportModal({ requireConsent: true });

        await chooseReport(user, 'print.png', 'image/png');
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'Enviar este arquivo?' });
        await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }));

        expect(screen.queryByRole('dialog', { name: 'Enviar este arquivo?' })).not.toBeInTheDocument();
        expect(api.previews).toHaveLength(1);
        expect(screen.queryByText('print.png')).not.toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'Confira as operações' })).not.toBeInTheDocument();
    });

    it('pergunta de novo a cada arquivo', async () => {
        const { user, api }: InvestmentImportSetup = renderInvestmentImportModal({ requireConsent: true });
        await chooseReport(user, 'um.pdf', PDF);
        await user.click(await screen.findByRole('button', { name: 'Cancelar' }));

        await chooseReport(user, 'dois.pdf', PDF);

        expect(await screen.findByRole('dialog', { name: 'Enviar este arquivo?' })).toBeInTheDocument();
        expect(api.previews.map((request) => request.fields['modelConsent'])).toEqual([undefined, undefined]);
    });

    it('CSV de cripto vai direto à prévia, sem confirmação', async () => {
        const preview: InvestmentPreview = investmentPreview({ source: 'crypto_csv' });
        const { user, api }: InvestmentImportSetup = renderInvestmentImportModal({ preview });

        await chooseReport(user, 'binance.csv', 'text/csv');

        expect(await screen.findByRole('heading', { name: 'Confira as operações' })).toBeInTheDocument();
        expect(screen.queryByRole('dialog', { name: 'Enviar este arquivo?' })).not.toBeInTheDocument();
        expect(api.previews).toHaveLength(1);
    });

    it('linha "Confira" aparece destacada e não bloqueia a confirmação', async () => {
        const preview: InvestmentPreview = investmentPreview({
            source: 'model',
            operations: [previewLine({ status: 'check', reason: null })]
        });
        const { user }: InvestmentImportSetup = renderInvestmentImportModal({ preview });

        await chooseReport(user, 'foto.jpg', 'image/jpeg');

        expect(await screen.findByText('Confira')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Confirmar importação' })).toBeEnabled();
    });

    it('operação em dólar mostra o valor em USD, a PTAX e o valor em BRL', async () => {
        const preview: InvestmentPreview = investmentPreview({
            source: 'model',
            documentType: 'foreign_statement',
            operations: [previewLine({ ticker: 'AAPL', currency: 'USD', grossMinor: 100000, fxRate: '5.1234', grossBrlMinor: 512340 })]
        });
        const { user }: InvestmentImportSetup = renderInvestmentImportModal({ preview });

        await chooseReport(user, 'extrato.pdf', PDF);

        const amounts: HTMLElement = await screen.findByLabelText('Valores em moeda estrangeira');
        expect(within(amounts).getByText('Valor em USD')).toBeInTheDocument();
        expect(within(amounts).getByText(/US\$\s1\.000,00/)).toBeInTheDocument();
        expect(within(amounts).getByText('5,1234')).toBeInTheDocument();
        expect(within(amounts).getByText(/R\$\s5\.123,40/)).toBeInTheDocument();
    });

    it('provento com retenção mostra bruto, imposto retido e líquido', async () => {
        const preview: InvestmentPreview = investmentPreview({
            source: 'model',
            operations: [
                previewLine({ kind: 'income', incomeKind: 'dividend', currency: 'USD', grossMinor: 10000, withheldTaxMinor: 3000 })
            ]
        });
        const { user }: InvestmentImportSetup = renderInvestmentImportModal({ preview });

        await chooseReport(user, 'extrato.pdf', PDF);

        const amounts: HTMLElement = await screen.findByLabelText('Provento com imposto retido');
        expect(within(amounts).getByText('Bruto')).toBeInTheDocument();
        expect(within(amounts).getByText(/US\$\s30,00/)).toBeInTheDocument();
        expect(within(amounts).getByText(/US\$\s70,00/)).toBeInTheDocument();
    });

    it.each([
        ['model.unavailable', 503, /leitura de notas, extratos e prints está fora do ar/],
        ['model.unreadable', 422, /Não conseguimos ler esse arquivo/]
    ])('traduz o erro %s', async (type: string, status: number, text: RegExp) => {
        const { user }: InvestmentImportSetup = renderInvestmentImportModal({ previewStatus: status, previewType: type });

        await chooseReport(user, 'nota.pdf', PDF);

        expect(await screen.findByText(text)).toBeInTheDocument();
        expect(screen.queryByRole('dialog', { name: 'Enviar este arquivo?' })).not.toBeInTheDocument();
    });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { chooseStatement, problem, renderImportModal, type ImportModalSetup } from '../../../../../test/helpers/import-modal';
import { stubNodeMultipart, statementFile } from '../../../../../test/helpers/node-multipart';
import { importCreated, ofxPreview } from '../../../../../test/fixtures/spending';
import { server } from '../../../../../test/msw/server';

beforeEach(async () => {
    await stubNodeMultipart();
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('ImportStatementModal: fluxo OFX', () => {
    it('envia a prévia uma vez, mostra o resumo e a conta sugerida', async () => {
        const { user, api }: ImportModalSetup = renderImportModal();

        await chooseStatement(user);

        expect(await screen.findByText('6 transações · de 02/09 a 27/09')).toBeInTheDocument();
        expect(screen.getByText('OFX')).toBeInTheDocument();
        expect(screen.getByText('Sugerimos Nubank Cartão (final 4321)')).toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: 'Conta' })).toHaveTextContent('Nubank Cartão');
        expect(screen.getByText('UBER *TRIP')).toBeInTheDocument();
        expect(api.previews).toEqual([{ fileText: 'OFXHEADER:100', fields: {} }]);
    });

    it('importa o mesmo arquivo na conta sugerida e mostra o resultado', async () => {
        const { user, api, router }: ImportModalSetup = renderImportModal();
        await chooseStatement(user);

        await user.click(await screen.findByRole('button', { name: 'Importar 6 transações' }));

        expect(await screen.findByText('4 novas transações')).toBeInTheDocument();
        expect(screen.getByText('2 já estavam na Vera e foram ignoradas')).toBeInTheDocument();
        expect(screen.getByText('Mesmo arquivo importado antes ou transações já trazidas pelo Meu Pluggy.')).toBeInTheDocument();
        expect(screen.getByText('Nenhuma linha rejeitada')).toBeInTheDocument();
        expect(api.commits).toEqual([{ fileText: 'OFXHEADER:100', fields: { format: 'ofx', accountId: 'acc-nubank-card' } }]);

        await user.click(screen.getByRole('link', { name: 'Ver transações' }));
        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/spending/transactions');
        });
        expect(router.state.location.search).toEqual({ accountId: 'acc-nubank-card', month: '2026-09' });
    });

    it('Importar outro volta ao passo do arquivo', async () => {
        const { user }: ImportModalSetup = renderImportModal();
        await chooseStatement(user);
        await user.click(await screen.findByRole('button', { name: 'Importar 6 transações' }));
        await screen.findByText('4 novas transações');

        await user.click(screen.getByRole('button', { name: 'Importar outro' }));

        expect(await screen.findByLabelText('Arquivo do extrato')).toBeInTheDocument();
    });

    it('avisa quando o arquivo já foi importado', async () => {
        const { user }: ImportModalSetup = renderImportModal({
            preview: () => ofxPreview({ alreadyImportedAt: '2026-10-05T15:00:00.000Z' })
        });

        await chooseStatement(user);

        expect(
            await screen.findByText('Você já importou este arquivo em 05/10. As transações repetidas serão ignoradas.')
        ).toBeInTheDocument();
    });

    it('lista as linhas rejeitadas por motivo', async () => {
        const { user }: ImportModalSetup = renderImportModal({
            preview: () =>
                ofxPreview({
                    rejected: 3,
                    rejections: [
                        { line: 4, reason: 'invalid_date' },
                        { line: 9, reason: 'invalid_date' },
                        { line: 12, reason: 'invalid_date' }
                    ]
                })
        });

        await chooseStatement(user);

        expect(await screen.findByText('3 linhas não puderam ser lidas (linhas 4, 9 e 12: data inválida)')).toBeInTheDocument();
    });

    it('mostra as rejeições do resultado', async () => {
        const { user }: ImportModalSetup = renderImportModal({
            created: importCreated({ rejected: 1, rejections: [{ line: 7, reason: 'invalid_amount' }] })
        });
        await chooseStatement(user);

        await user.click(await screen.findByRole('button', { name: 'Importar 6 transações' }));

        expect(await screen.findByText('1 linha rejeitada')).toBeInTheDocument();
        expect(screen.getByText('1 linha não pôde ser lida (linha 7: valor inválido)')).toBeInTheDocument();
    });
});

describe('ImportStatementModal: conta de destino', () => {
    it('sem contas, começa em nova conta com o nome sugerido pela instituição', async () => {
        const { user, api }: ImportModalSetup = renderImportModal({ withAccounts: false });
        await chooseStatement(user);

        const name: HTMLElement = await screen.findByRole('textbox', { name: 'Nome da conta' });
        expect(name).toHaveValue('Nubank');
        expect(screen.queryByRole('radiogroup', { name: 'Onde guardar as transações' })).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Importar 6 transações' }));

        await screen.findByText('4 novas transações');
        expect(api.commits[0]?.fields).toEqual({ format: 'ofx', newAccountName: 'Nubank', newAccountKind: 'checking' });
    });

    it('bloqueia o envio com o nome vazio', async () => {
        const { user, api }: ImportModalSetup = renderImportModal({ withAccounts: false });
        await chooseStatement(user);
        const name: HTMLElement = await screen.findByRole('textbox', { name: 'Nome da conta' });

        await user.clear(name);
        await user.click(screen.getByRole('button', { name: 'Importar 6 transações' }));

        expect(await screen.findByText('Dê um nome para a conta')).toBeInTheDocument();
        expect(api.commits).toHaveLength(0);
    });

    it('troca para nova conta com tipo e instituição', async () => {
        const { user, api }: ImportModalSetup = renderImportModal();
        await chooseStatement(user);

        await user.click(await screen.findByRole('radio', { name: 'Nova conta' }));
        await user.clear(screen.getByRole('textbox', { name: 'Nome da conta' }));
        await user.type(screen.getByRole('textbox', { name: 'Nome da conta' }), 'Reserva');
        await user.click(screen.getByRole('combobox', { name: 'Tipo da conta' }));
        await user.click(await screen.findByRole('option', { name: 'Poupança' }));
        await user.type(screen.getByRole('textbox', { name: 'Instituição (opcional)' }), 'Banco X');
        await user.click(screen.getByRole('button', { name: 'Importar 6 transações' }));

        await screen.findByText('4 novas transações');
        expect(api.commits[0]?.fields).toEqual({
            format: 'ofx',
            newAccountName: 'Reserva',
            newAccountKind: 'savings',
            newAccountInstitution: 'Banco X'
        });
    });

    it('sem sugestão, exige escolher a conta', async () => {
        const { user, api }: ImportModalSetup = renderImportModal({
            preview: () => ofxPreview({ suggestedAccountId: null, accountHint: null })
        });
        await chooseStatement(user);

        await user.click(await screen.findByRole('button', { name: 'Importar 6 transações' }));

        expect(await screen.findByText('Escolha a conta de destino')).toBeInTheDocument();
        await user.click(screen.getByRole('combobox', { name: 'Conta' }));
        await user.click(await screen.findByRole('option', { name: 'Itaú Conta' }));
        await user.click(screen.getByRole('button', { name: 'Importar 6 transações' }));
        await screen.findByText('4 novas transações');
        expect(api.commits[0]?.fields['accountId']).toBe('acc-itau-checking');
    });
});

describe('ImportStatementModal: erros', () => {
    it('recusa no cliente um arquivo acima de 5 MB, sem requisição', async () => {
        const { user, api }: ImportModalSetup = renderImportModal();
        const input: HTMLElement = await screen.findByLabelText('Arquivo do extrato');

        await user.upload(input, statementFile('x'.repeat(5 * 1024 * 1024 + 1), 'grande.ofx'));

        expect(await screen.findByText('O arquivo passa de 5 MB')).toBeInTheDocument();
        expect(api.previews).toHaveLength(0);
    });

    it('traduz o formato não reconhecido', async () => {
        const { user }: ImportModalSetup = renderImportModal();
        server.use(http.post('*/spending/imports/preview', () => problem('imports.unsupported_format', 422)));

        await chooseStatement(user, 'lixo', 'lixo.txt');

        expect(await screen.findByText('Não reconhecemos este arquivo. Use OFX ou CSV.')).toBeInTheDocument();
    });

    it('traduz a moeda diferente da conta com as duas moedas', async () => {
        const { user }: ImportModalSetup = renderImportModal({ preview: () => ofxPreview({ currency: 'USD' }) });
        server.use(http.post('*/spending/imports', () => problem('imports.currency_mismatch', 422)));
        await chooseStatement(user);

        await user.click(await screen.findByRole('button', { name: 'Importar 6 transações' }));

        expect(await screen.findByText('Este extrato está em USD e a conta é em BRL.')).toBeInTheDocument();
        expect(screen.queryByText('4 novas transações')).not.toBeInTheDocument();
    });

    it('falha de rede na prévia vira toast crítico', async () => {
        const { user }: ImportModalSetup = renderImportModal();
        server.use(http.post('*/spending/imports/preview', () => HttpResponse.error()));

        await chooseStatement(user);

        const toast: HTMLElement = await screen.findByText('Não foi possível ler o arquivo');
        expect(toast).toBeInTheDocument();
    });

    it('falha de rede na importação vira toast crítico e mantém a prévia', async () => {
        const { user }: ImportModalSetup = renderImportModal();
        server.use(http.post('*/spending/imports', () => HttpResponse.error()));
        await chooseStatement(user);

        await user.click(await screen.findByRole('button', { name: 'Importar 6 transações' }));

        expect(await screen.findByText('Não foi possível importar o arquivo')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Importar 6 transações' })).toBeEnabled();
    });

    it('trocar o arquivo limpa a prévia', async () => {
        const { user }: ImportModalSetup = renderImportModal();
        await chooseStatement(user);
        await screen.findByText('6 transações · de 02/09 a 27/09');

        await user.click(screen.getByRole('button', { name: 'Trocar' }));

        expect(await screen.findByLabelText('Arquivo do extrato')).toBeInTheDocument();
        expect(screen.queryByText('6 transações · de 02/09 a 27/09')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Importar' })).toBeDisabled();
    });

    it('Cancelar chama onClose', async () => {
        const { user, onClose }: ImportModalSetup = renderImportModal();

        await user.click(await screen.findByRole('button', { name: 'Cancelar' }));

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(within(screen.getByRole('dialog')).getByRole('heading', { name: 'Importar extrato' })).toBeInTheDocument();
    });
});

describe('ImportStatementModal: aguardando a prévia', () => {
    it('mostra o carregamento enquanto lê o arquivo', async () => {
        const { user }: ImportModalSetup = renderImportModal();
        server.use(
            http.post('*/spending/imports/preview', async () => {
                await new Promise<void>((resolve: () => void): void => {
                    setTimeout(resolve, 150);
                });
                return HttpResponse.json(ofxPreview());
            })
        );

        await chooseStatement(user);

        expect(await screen.findByRole('status')).toHaveTextContent('Lendo o arquivo');
        await screen.findByText('6 transações · de 02/09 a 27/09');
    });
});

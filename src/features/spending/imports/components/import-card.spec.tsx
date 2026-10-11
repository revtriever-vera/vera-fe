import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { i18n } from '@/shared/lib/i18n';
import { emptyImports, importView } from '../../../../../test/fixtures/spending';
import { problem } from '../../../../../test/helpers/import-modal';
import { renderInRouter } from '../../../../../test/helpers/render-in-router';
import { server } from '../../../../../test/msw/server';
import type { ImportView, ImportsResponse } from '../../types';
import { ImportCard } from './import-card';

function page(data: ImportView[], pageNumber: number = 1, totalPages: number = 1): ImportsResponse {
    return { data, pagination: { page: pageNumber, pageSize: 10, totalRecords: data.length, totalPages } };
}

function mockList(response: ImportsResponse): void {
    server.use(http.get('*/spending/imports', () => HttpResponse.json(response)));
}

describe('ImportCard', () => {
    it('explica o que aceita e mostra o histórico vazio', async () => {
        renderInRouter(<ImportCard />);

        expect(await screen.findByRole('heading', { name: 'Importar arquivo' })).toBeInTheDocument();
        expect(
            screen.getByText('Funciona com qualquer banco: OFX ou CSV do seu banco (inclusive da fatura do cartão).')
        ).toBeInTheDocument();
        expect(await screen.findByText('Nenhum extrato importado ainda.')).toBeInTheDocument();
    });

    it('lista arquivo, conta, data, contagens e status', async () => {
        mockList(page([importView(), importView({ id: 'imp-2', fileName: 'antigo.csv', status: 'undone', inserted: 1, duplicates: 0 })]));
        renderInRouter(<ImportCard />);

        const list: HTMLElement = await screen.findByRole('list', { name: 'Extratos importados' });

        const [first, second] = within(list).getAllByRole('listitem');
        expect(first).toHaveTextContent('vera-qa-nubank-cartao.ofx');
        expect(first).toHaveTextContent('Nubank Cartão · 01/10/2026 · 4 novas · 2 ignoradas');
        expect(first).toHaveTextContent('concluído');
        expect(second).toHaveTextContent('desfeito');
        expect(within(second as HTMLElement).queryByRole('button', { name: /Desfazer/ })).not.toBeInTheDocument();
        expect(
            within(second as HTMLElement)
                .getByText('antigo.csv')
                .closest('div')
        ).toHaveClass('line-through');
    });

    it('desfazer pede confirmação, chama o DELETE e mostra o toast', async () => {
        const user: UserEvent = userEvent.setup();
        mockList(page([importView()]));
        const removed: string[] = [];
        server.use(
            http.delete('*/spending/imports/:id', ({ params }) => {
                removed.push(String(params['id']));
                return HttpResponse.json({ removed: 4 });
            })
        );
        renderInRouter(<ImportCard />);

        await user.click(await screen.findByRole('button', { name: 'Desfazer a importação de vera-qa-nubank-cartao.ofx' }));
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'Desfazer esta importação?' });
        expect(dialog).toHaveTextContent(
            'As 4 transações que vieram deste arquivo saem da Vera. Transações que também vieram pelo Meu Pluggy continuam.'
        );
        await user.click(within(dialog).getByRole('button', { name: 'Desfazer importação' }));

        expect(await screen.findByText('4 transações removidas')).toBeInTheDocument();
        expect(removed).toEqual(['imp-1']);
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    it('cancelar a confirmação não chama o DELETE', async () => {
        const user: UserEvent = userEvent.setup();
        mockList(page([importView()]));
        renderInRouter(<ImportCard />);

        await user.click(await screen.findByRole('button', { name: /Desfazer a importação/ }));
        await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Cancelar' }));

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    it('erro ao desfazer vira toast crítico', async () => {
        const user: UserEvent = userEvent.setup();
        mockList(page([importView()]));
        server.use(http.delete('*/spending/imports/:id', () => problem('imports.import_not_found', 404)));
        renderInRouter(<ImportCard />);

        await user.click(await screen.findByRole('button', { name: /Desfazer a importação/ }));
        await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Desfazer importação' }));

        expect(await screen.findByText('Não foi possível desfazer a importação')).toBeInTheDocument();
        expect(screen.getByText('Essa importação não existe mais.')).toBeInTheDocument();
    });

    it('pagina o histórico', async () => {
        const user: UserEvent = userEvent.setup();
        const requested: string[] = [];
        server.use(
            http.get('*/spending/imports', ({ request }) => {
                const pageNumber: number = Number(new URL(request.url).searchParams.get('page'));
                requested.push(String(pageNumber));
                return HttpResponse.json(
                    page([importView({ id: `imp-${String(pageNumber)}`, fileName: `p${String(pageNumber)}.ofx` })], pageNumber, 2)
                );
            })
        );
        renderInRouter(<ImportCard />);

        await screen.findByText('p1.ofx');
        await user.click(screen.getByRole('button', { name: 'Próxima' }));

        expect(await screen.findByText('p2.ofx')).toBeInTheDocument();
        expect(requested).toEqual(['1', '2']);
    });

    it('falha ao carregar mostra o aviso', async () => {
        server.use(http.get('*/spending/imports', () => problem('validation_failed', 500)));
        renderInRouter(<ImportCard />);

        expect(await screen.findByText('Não foi possível carregar os extratos importados.')).toBeInTheDocument();
    });

    it('em inglês', async () => {
        await i18n.changeLanguage('en');
        mockList(emptyImports());
        renderInRouter(<ImportCard />);

        expect(await screen.findByRole('heading', { name: 'Import a file' })).toBeInTheDocument();
        expect(await screen.findByText('No statements imported yet.')).toBeInTheDocument();
    });
});

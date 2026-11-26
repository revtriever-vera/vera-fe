import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { ASSISTANT_SLOTS } from '@/app/layouts/assistant-mount';
import { actionSummary, actionView, assistantMessage, conversationWith, emptyConversation } from '../../../../test/fixtures/assistant';
import { investmentPreview } from '../../../../test/fixtures/investment-imports';
import { server } from '../../../../test/msw/server';
import { renderSummaries } from '../../../../test/render-summaries';
import { AssistantSlotsContext } from '../lib/assistant-slots';
import type { ActionSummary } from '../types';
import { AssistantAction } from './assistant-action';
import { AssistantLauncher } from './assistant-launcher';

const NOTE: File = new File(['conteudo'], 'nota.pdf', { type: 'application/pdf' });

function problem(type: string, status: number): Response {
    return HttpResponse.json({ type, title: type, status, detail: type, requestId: 'req-1' }, { status });
}

function importAction(overrides: Partial<ActionSummary> = {}): ActionSummary {
    return actionSummary({ tool: 'investment_import', summary: 'Importar 1 operação em 1 ativo.', ...overrides });
}

function renderLauncher(role: 'owner' | 'viewer' = 'owner'): void {
    renderSummaries(
        <AssistantSlotsContext value={ASSISTANT_SLOTS}>
            <AssistantLauncher />
        </AssistantSlotsContext>,
        { identity: { role } }
    );
}

async function openPanel(user: UserEvent): Promise<void> {
    await user.click(await screen.findByRole('button', { name: 'Perguntar à Vera' }));
}

describe('painel em tela inteira', () => {
    it('o botão alterna entre tela inteira e painel lateral', async () => {
        const user: UserEvent = userEvent.setup();
        renderLauncher();
        await openPanel(user);

        const expand: HTMLElement = await screen.findByRole('button', { name: 'Abrir em tela inteira' });
        await user.click(expand);

        expect(await screen.findByRole('button', { name: 'Voltar ao painel lateral' })).toBeInTheDocument();
    });
});

describe('área de soltar o arquivo', () => {
    it('mostra os tipos aceitos e só aparece para quem pode importar', async () => {
        const user: UserEvent = userEvent.setup();
        renderLauncher();
        await openPanel(user);

        expect(await screen.findByText(/Nota de corretagem, extrato da corretora/)).toBeInTheDocument();
    });

    it('Leitura não vê a área de soltar', async () => {
        const user: UserEvent = userEvent.setup();
        renderLauncher('viewer');
        await openPanel(user);

        await screen.findByRole('textbox', { name: 'Sua pergunta' });
        expect(screen.queryByText(/Nota de corretagem, extrato da corretora/)).not.toBeInTheDocument();
    });

    it('arquivo sem texto envia em multipart, com a tela e sem o envio ao modelo confirmado', async () => {
        const forms: FormData[] = [];
        server.use(
            http.post('*/assistant/turns', async ({ request }): Promise<Response> => {
                forms.push(await request.formData());
                return HttpResponse.json({ turnId: 't1', conversationId: 'conversation-1' }, { status: 202 });
            })
        );
        const user: UserEvent = userEvent.setup();
        renderLauncher();
        await openPanel(user);

        await user.upload(await screen.findByLabelText('Arquivo para importar'), NOTE);
        await user.click(await screen.findByRole('button', { name: 'Enviar' }));

        await waitFor((): void => {
            expect(forms).toHaveLength(1);
        });
        const form: FormData = forms[0] as FormData;
        expect((form.get('file') as Blob).size).toBeGreaterThan(0);
        expect(form.get('text')).toBeNull();
        expect(form.get('screenPath')).toBe('/');
        expect(form.get('modelConsent')).toBeNull();
    });

    it('428 pede o envio ao modelo; confirmar reenvia com modelConsent e recusar não reenvia', async () => {
        const forms: FormData[] = [];
        server.use(
            http.post('*/assistant/turns', async ({ request }): Promise<Response> => {
                const form: FormData = await request.formData();
                forms.push(form);
                return form.get('modelConsent') === 'true'
                    ? HttpResponse.json({ turnId: 't1', conversationId: 'conversation-1' }, { status: 202 })
                    : problem('model.confirmation_required', 428);
            })
        );
        const user: UserEvent = userEvent.setup();
        renderLauncher();
        await openPanel(user);
        await user.upload(await screen.findByLabelText('Arquivo para importar'), NOTE);
        await user.type(await screen.findByRole('textbox', { name: 'Sua pergunta' }), 'importa isso');
        await user.click(await screen.findByRole('button', { name: 'Enviar' }));

        expect(await screen.findByText('Enviar este arquivo?')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Cancelar' }));
        await waitFor((): void => {
            expect(screen.queryByText('Enviar este arquivo?')).not.toBeInTheDocument();
        });
        expect(forms).toHaveLength(1);

        await user.upload(await screen.findByLabelText('Arquivo para importar'), NOTE);
        await user.type(await screen.findByRole('textbox', { name: 'Sua pergunta' }), 'importa isso');
        await user.click(await screen.findByRole('button', { name: 'Enviar' }));
        await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Enviar' }));

        await waitFor((): void => {
            expect(forms).toHaveLength(3);
        });
        expect(forms[2]?.get('modelConsent')).toBe('true');
        expect(forms[2]?.get('text')).toBe('importa isso');
    });

    it('um erro do arquivo aparece traduzido', async () => {
        server.use(http.post('*/assistant/turns', (): Response => problem('format.not_recognized', 422)));
        const user: UserEvent = userEvent.setup();
        renderLauncher();
        await openPanel(user);
        await user.upload(await screen.findByLabelText('Arquivo para importar'), NOTE);
        await user.click(await screen.findByRole('button', { name: 'Enviar' }));

        expect(await screen.findByText(/Não reconheci esse arquivo/)).toBeInTheDocument();
    });

    it('a conversa com arquivo mostra o nome guardado', async () => {
        server.use(
            http.get('*/assistant/conversations/current', (): Response =>
                HttpResponse.json(conversationWith([assistantMessage({ id: 'p1', role: 'person', text: 'Arquivo: nota.pdf' })]))
            )
        );
        const user: UserEvent = userEvent.setup();
        renderLauncher();
        await openPanel(user);

        expect(await screen.findByText('Arquivo: nota.pdf')).toBeInTheDocument();
    });
});

describe('cartão da importação', () => {
    function renderCard(action: ActionSummary = importAction()): void {
        renderSummaries(
            <AssistantSlotsContext value={ASSISTANT_SLOTS}>
                <AssistantAction action={action} onAskAgain={(): void => undefined} />
            </AssistantSlotsContext>
        );
    }

    it('mostra a prévia reaproveitando a tabela e o efeito da importação, e confirma com as correções', async () => {
        const sent: unknown[] = [];
        server.use(
            http.get('*/assistant/actions/:id', (): Response =>
                HttpResponse.json(actionView({ tool: 'investment_import', importPreview: { ...investmentPreview() } }))
            ),
            http.post('*/assistant/actions/:id/confirm', async ({ request }): Promise<Response> => {
                sent.push(await request.json());
                return HttpResponse.json(
                    importAction({ status: 'confirmed', resultText: 'Importação confirmada: 1 operação.', reference: 'import-1' })
                );
            })
        );
        const user: UserEvent = userEvent.setup();
        renderCard();

        expect(await screen.findByText('Importar 1 operação em 1 ativo.')).toBeInTheDocument();
        expect(await screen.findByText('PETR4')).toBeInTheDocument();
        await user.click(await screen.findByRole('button', { name: 'Confirmar' }));

        expect(await screen.findByText('Importação confirmada: 1 operação.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Ver ativos' })).toHaveAttribute('href', '/portfolio/assets');
        expect(sent).toEqual([{ edits: [], fixedIncome: [] }]);
    });

    it('cancelar não confirma', async () => {
        server.use(
            http.get('*/assistant/actions/:id', (): Response =>
                HttpResponse.json(actionView({ tool: 'investment_import', importPreview: { ...investmentPreview() } }))
            )
        );
        const user: UserEvent = userEvent.setup();
        renderCard();

        await user.click(await screen.findByRole('button', { name: 'Cancelar' }));

        expect(await screen.findByText('Cancelado. Nada foi alterado.')).toBeInTheDocument();
    });

    it('prévia vencida: pede o arquivo de novo e não oferece confirmar', async () => {
        server.use(
            http.get('*/assistant/actions/:id', (): Response =>
                HttpResponse.json(actionView({ tool: 'investment_import', importPreview: null }))
            )
        );
        renderCard();

        expect(await screen.findByText(/A conferência expirou\. Solte o arquivo de novo/)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Confirmar' })).not.toBeInTheDocument();
    });

    it('conversa vazia continua mostrando as sugestões', async () => {
        server.use(http.get('*/assistant/conversations/current', (): Response => HttpResponse.json(emptyConversation())));
        const user: UserEvent = userEvent.setup();
        renderLauncher();
        await openPanel(user);

        expect(await screen.findByText('O que você quer saber?')).toBeInTheDocument();
    });
});

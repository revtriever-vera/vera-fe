import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { QueryClient, QueryClientProvider, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { EmptyState } from '@/shared/ui/empty-state';
import { SampleDataBanner } from '@/shared/ui/sample-data-banner';
import { SampleDataButton } from '@/shared/ui/sample-data-button';
import { onboardingKeys } from '@/features/onboarding/api/onboarding-keys';
import { useOnboardingState } from '@/features/onboarding/api/use-onboarding-state.query';
import { sampleServer, type SampleServer } from '../../../test/msw/handlers/onboarding.handlers';
import { server } from '../../../test/msw/server';
import { SampleDataProvider } from './sample-data-provider';
import { ToastProvider } from './toast-provider';

const tracked: Mock = vi.hoisted((): Mock => vi.fn());

vi.mock('@/shared/lib/analytics', () => ({ track: tracked }));

vi.mock('@tanstack/react-router', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@tanstack/react-router')>()),
    useRouterState: ({ select }: { select: (state: { matches: { routeId: string }[] }) => string }): string =>
        select({ matches: [{ routeId: '/_auth/_app/portfolio/assets' }] })
}));

interface Counters {
    readonly assets: Mock;
    readonly session: Mock;
}

const ITEMS: readonly string[] = ['PETR4', 'MXRF11'];

function FakeAssetsPage({ counters }: { readonly counters: Counters }): ReactElement {
    const assets: UseQueryResult<readonly string[]> = useQuery({
        queryKey: ['assets'],
        queryFn: async (): Promise<readonly string[]> => {
            counters.assets();
            const response: Response = await fetch('http://localhost/assets');
            return (await response.json()) as readonly string[];
        }
    });
    useQuery({
        queryKey: ['auth', 'me'],
        queryFn: (): Promise<string> => {
            counters.session();
            return Promise.resolve('me');
        }
    });
    useOnboardingState();

    if (assets.data === undefined) {
        return <p>loading</p>;
    }
    if (assets.data.length === 0) {
        return <EmptyState title="Sua carteira ainda está vazia" description="Cadastre o que você tem." actions={<SampleDataButton />} />;
    }
    return (
        <ul>
            {assets.data.map((ticker: string): ReactElement => (
                <li key={ticker}>{ticker}</li>
            ))}
        </ul>
    );
}

function Harness({ counters, client }: { readonly counters: Counters; readonly client: QueryClient }): ReactElement {
    return (
        <QueryClientProvider client={client}>
            <ToastProvider>
                <SampleDataProvider>
                    <SampleDataBanner />
                    <FakeAssetsPage counters={counters} />
                </SampleDataProvider>
            </ToastProvider>
        </QueryClientProvider>
    );
}

function setup(
    initial: { active: boolean; available: boolean },
    loadGate?: Promise<void>
): { counters: Counters; client: QueryClient; sample: SampleServer } {
    const sample: SampleServer = sampleServer(initial, loadGate);
    server.use(
        ...sample.handlers,
        http.get('http://localhost/assets', () => HttpResponse.json(sample.isActive() ? ITEMS : []))
    );
    const client: QueryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    return { counters: { assets: vi.fn(), session: vi.fn() }, client, sample };
}

describe('SampleDataProvider', () => {
    beforeEach(() => {
        tracked.mockClear();
    });

    it('não mostra o botão quando nenhum módulo registrou dados de exemplo', async () => {
        const { counters, client } = setup({ active: false, available: false });
        render(<Harness counters={counters} client={client} />);

        expect(await screen.findByRole('heading', { name: 'Sua carteira ainda está vazia' })).toBeInTheDocument();
        await waitFor(() => {
            expect(client.getQueryData(onboardingKeys.state())).toBeDefined();
        });
        expect(screen.queryByRole('button', { name: 'Explorar com dados de exemplo' })).not.toBeInTheDocument();
    });

    it('carrega o exemplo, refaz as queries de outros módulos e preserva a sessão', async () => {
        const user: UserEvent = userEvent.setup();
        const { counters, client, sample } = setup({ active: false, available: true });
        render(<Harness counters={counters} client={client} />);

        await user.click(await screen.findByRole('button', { name: 'Explorar com dados de exemplo' }));

        expect(await screen.findByText('PETR4')).toBeInTheDocument();
        expect(screen.getByText('Você está vendo dados de exemplo. Eles não são seus.')).toBeInTheDocument();
        expect(await screen.findByText('Dados de exemplo carregados')).toBeInTheDocument();
        expect(sample.calls.load).toBe(1);
        expect(counters.assets).toHaveBeenCalledTimes(2);
        expect(counters.session).toHaveBeenCalledTimes(1);
        expect(client.getQueryState(onboardingKeys.state())?.isInvalidated).toBe(false);
        expect(tracked).toHaveBeenCalledWith('sample_data_loaded', { source: 'empty_state', screen: '/_auth/_app/portfolio/assets' });
    });

    it('limpa o exemplo depois da confirmação e volta ao estado vazio', async () => {
        const user: UserEvent = userEvent.setup();
        const { counters, client, sample } = setup({ active: true, available: true });
        render(<Harness counters={counters} client={client} />);
        expect(await screen.findByText('PETR4')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Limpar dados de exemplo' }));
        await user.click(await screen.findByRole('button', { name: 'Cancelar' }));
        expect(sample.calls.clear).toBe(0);

        await user.click(screen.getByRole('button', { name: 'Limpar dados de exemplo' }));
        const dialog: HTMLElement = await screen.findByRole('dialog');
        await user.click(within(dialog).getByRole('button', { name: 'Limpar dados de exemplo' }));

        expect(await screen.findByRole('heading', { name: 'Sua carteira ainda está vazia' })).toBeInTheDocument();
        expect(sample.calls.clear).toBe(1);
        expect(screen.queryByText('Você está vendo dados de exemplo. Eles não são seus.')).not.toBeInTheDocument();
        expect(await screen.findByText('Dados de exemplo removidos')).toBeInTheDocument();
        expect(tracked).toHaveBeenCalledWith('sample_data_cleared');
    });

    it.each([
        [409, 'onboarding.sample_unavailable', 'Os dados de exemplo não estão disponíveis no momento.'],
        [500, 'onboarding.sample_failed', 'Não foi possível carregar os dados de exemplo. Nada foi alterado.']
    ])('traduz o erro %i pelo código', async (status: number, type: string, message: string) => {
        const user: UserEvent = userEvent.setup();
        const { counters, client, sample } = setup({ active: false, available: true });
        server.use(
            http.post('*/onboarding/sample', () =>
                HttpResponse.json({ type, title: 'Error', status, detail: 'internal detail', requestId: null }, { status })
            )
        );
        render(<Harness counters={counters} client={client} />);

        await user.click(await screen.findByRole('button', { name: 'Explorar com dados de exemplo' }));

        expect(await screen.findByText(message)).toBeInTheDocument();
        expect(screen.queryByText('internal detail')).not.toBeInTheDocument();
        expect(sample.calls.load).toBe(0);
        expect(screen.getByRole('heading', { name: 'Sua carteira ainda está vazia' })).toBeInTheDocument();
        expect(tracked).not.toHaveBeenCalled();
    });

    it('evita clique duplo enquanto a carga está em andamento', async () => {
        const user: UserEvent = userEvent.setup();
        let release: () => void = (): void => undefined;
        const gate: Promise<void> = new Promise<void>((resolve) => {
            release = resolve;
        });
        const { counters, client, sample } = setup({ active: false, available: true }, gate);
        render(<Harness counters={counters} client={client} />);

        const button: HTMLElement = await screen.findByRole('button', { name: 'Explorar com dados de exemplo' });
        await user.click(button);
        await waitFor(() => {
            expect(button).toBeDisabled();
        });
        await user.click(button);
        release();

        expect(await screen.findByText('PETR4')).toBeInTheDocument();
        expect(sample.calls.load).toBe(1);
    });
});

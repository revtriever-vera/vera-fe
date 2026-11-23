import { track } from '@/shared/lib/analytics';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { http } from 'msw';
import type { IssuerItem } from '@/features/portfolio/assets/types';
import { fgcSimulation, issuerItem } from '../../../../../test/fixtures/assets';
import { chooseType, renderAddAsset, submitAdd, type AddAssetSetup } from '../../../../../test/helpers/add-asset';
import { mockAssetsApi, problem, type AssetsApi } from '../../../../../test/helpers/assets-api';
import { server } from '../../../../../test/msw/server';

const mocks: { env: Record<string, string> } = vi.hoisted(() => ({ env: { VITE_REPO_URL: '' } }));

vi.mock('@/shared/config/env', async (importOriginal: () => Promise<{ env: Record<string, string> }>) => {
    const actual: { env: Record<string, string> } = await importOriginal();
    return { env: new Proxy(actual.env, { get: (target, key: string): string => mocks.env[key] ?? target[key] ?? '' }) };
});

const BANKS: IssuerItem[] = [
    issuerItem(),
    issuerItem({ id: 'banco-inter', name: 'Banco Inter', groupId: 'inter-co', groupName: 'Inter&Co' })
];

async function openFixedIncome(): Promise<AddAssetSetup> {
    const setup: AddAssetSetup = renderAddAsset();
    await chooseType(setup.user, 'Renda fixa');
    return setup;
}

async function pickIssuer(user: UserEvent, text: string, name: string): Promise<void> {
    await user.type(await screen.findByRole('combobox', { name: 'Emissor' }), text);
    await user.click(await screen.findByRole('option', { name: new RegExp(name) }));
}

async function pickKind(user: UserEvent, name: string): Promise<void> {
    await user.click(screen.getByRole('combobox', { name: 'Tipo do título' }));
    await user.click(await screen.findByRole('option', { name }));
}

async function fillTerms(user: UserEvent): Promise<void> {
    await user.type(await screen.findByRole('textbox', { name: 'Valor aplicado' }), '50000');
    await user.type(screen.getByRole('textbox', { name: 'Data da aplicação' }), '10032025');
    await user.type(screen.getByRole('textbox', { name: 'Vencimento' }), '10032028');
}

beforeEach(() => {
    mocks.env['VITE_REPO_URL'] = '';
});

describe('AddAssetModal: emissor do título', () => {
    it('busca só emissores do grupo do tipo e mostra o conglomerado', async () => {
        const api: AssetsApi = mockAssetsApi();
        const { user }: AddAssetSetup = await openFixedIncome();
        await user.type(await screen.findByRole('combobox', { name: 'Emissor' }), 'xp');

        expect(await screen.findByRole('option', { name: /Banco XP/ })).toBeInTheDocument();
        expect(screen.queryByRole('option', { name: /Petrobras/ })).toBeNull();
        await waitFor(() => {
            expect(api.issuerSearches).toContain('bank|xp');
        });
        await user.click(screen.getByRole('option', { name: /Banco XP/ }));

        expect(screen.getByText('Banco XP · conglomerado XP')).toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: 'Emissor' })).toHaveValue('Banco XP');
        expect(track).toHaveBeenCalledWith('issuer_searched', { kind: 'bank', hasResults: true });
        expect(track).toHaveBeenCalledWith('fixed_income_issuer_set', { context: 'create' });
    });

    it('trocar de CDB para debênture limpa o emissor e busca empresas', async () => {
        const api: AssetsApi = mockAssetsApi();
        const { user }: AddAssetSetup = await openFixedIncome();
        await pickIssuer(user, 'xp', 'Banco XP');

        await pickKind(user, 'Debênture');

        expect(screen.getByRole('combobox', { name: 'Emissor' })).toHaveValue('');
        expect(screen.queryByText(/conglomerado XP/)).toBeNull();
        expect(screen.getByRole('textbox', { name: 'Nome do título' })).toHaveValue('');
        await user.click(screen.getByRole('combobox', { name: 'Emissor' }));
        expect(await screen.findByRole('option', { name: /Petrobras/ })).toBeInTheDocument();
        expect(api.issuerSearches).toContain('company|');
    });

    it('trocar entre tipos do mesmo grupo mantém o emissor e atualiza o nome', async () => {
        mockAssetsApi();
        const { user }: AddAssetSetup = await openFixedIncome();
        await pickIssuer(user, 'xp', 'Banco XP');
        expect(screen.getByRole('textbox', { name: 'Nome do título' })).toHaveValue('CDB Banco XP');

        await pickKind(user, 'LCI');

        expect(screen.getByRole('combobox', { name: 'Emissor' })).toHaveValue('Banco XP');
        expect(screen.getByRole('textbox', { name: 'Nome do título' })).toHaveValue('LCI Banco XP');
    });

    it('o nome automático para de mudar depois que a pessoa edita', async () => {
        mockAssetsApi({ issuers: BANKS });
        const { user }: AddAssetSetup = await openFixedIncome();
        await pickIssuer(user, 'xp', 'Banco XP');
        const name: HTMLElement = screen.getByRole('textbox', { name: 'Nome do título' });
        await user.type(name, ' 2028');
        expect(name).toHaveValue('CDB Banco XP 2028');

        await user.clear(screen.getByRole('combobox', { name: 'Emissor' }));
        await pickIssuer(user, 'inter', 'Banco Inter');
        await pickKind(user, 'LCA');

        expect(name).toHaveValue('CDB Banco XP 2028');
    });

    it('navega a lista pelo teclado e escolhe com Enter', async () => {
        mockAssetsApi({ issuers: BANKS });
        const { user }: AddAssetSetup = await openFixedIncome();
        const box: HTMLElement = await screen.findByRole('combobox', { name: 'Emissor' });
        await user.click(box);
        await screen.findByRole('option', { name: /Banco Inter/ });
        expect(box).toHaveAttribute('aria-expanded', 'true');

        await user.keyboard('{ArrowDown}');
        expect(box).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: /Banco Inter/ }).id);
        await user.keyboard('{Enter}');

        expect(box).toHaveValue('Banco Inter');
        expect(box).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByRole('listbox')).toBeNull();
    });

    it('Escape fecha a lista sem escolher', async () => {
        mockAssetsApi();
        const { user }: AddAssetSetup = await openFixedIncome();
        const box: HTMLElement = await screen.findByRole('combobox', { name: 'Emissor' });
        await user.click(box);
        await screen.findByRole('option', { name: /Banco XP/ });

        await user.keyboard('{Escape}');

        expect(screen.queryByRole('listbox')).toBeNull();
        expect(box).toHaveValue('');
    });

    it('sem resultado, orienta e leva à lista quando há link', async () => {
        mocks.env['VITE_REPO_URL'] = 'https://example.test/emissores.json';
        mockAssetsApi();
        const { user }: AddAssetSetup = await openFixedIncome();
        await user.type(await screen.findByRole('combobox', { name: 'Emissor' }), 'zzz');

        expect(await screen.findByText(/Nenhum emissor com esse nome/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Ver a lista de emissores' })).toHaveAttribute(
            'href',
            'https://example.test/emissores.json'
        );
    });

    it('sem resultado e sem link configurado, mostra só o texto', async () => {
        mockAssetsApi();
        const { user }: AddAssetSetup = await openFixedIncome();
        await user.type(await screen.findByRole('combobox', { name: 'Emissor' }), 'zzz');

        expect(await screen.findByText(/Nenhum emissor com esse nome/)).toBeInTheDocument();
        expect(screen.queryByRole('link')).toBeNull();
    });

    it('avisa quando a busca falha', async () => {
        mockAssetsApi();
        server.use(http.get('*/issuers', () => problem('core.internal', 500)));
        const { user }: AddAssetSetup = await openFixedIncome();
        await user.click(await screen.findByRole('combobox', { name: 'Emissor' }));

        expect(await screen.findByText('Não foi possível buscar agora. Tente de novo.', undefined, { timeout: 8000 })).toBeInTheDocument();
    }, 15000);

    it('título novo sem emissor não é enviado', async () => {
        const api: AssetsApi = mockAssetsApi();
        const { user }: AddAssetSetup = await openFixedIncome();
        await fillTerms(user);
        await user.type(screen.getByRole('textbox', { name: 'Nome do título' }), 'CDB sem emissor');

        expect(screen.getByRole('button', { name: 'Adicionar à carteira' })).toBeDisabled();
        await submitAdd(user);
        expect(api.titleBodies).toEqual([]);
    });
});

describe('AddAssetModal: prévia do FGC', () => {
    it('CDB coberto: manda emissor, tipo e valor e mostra a frase', async () => {
        const api: AssetsApi = mockAssetsApi();
        const { user }: AddAssetSetup = await openFixedIncome();
        await pickIssuer(user, 'xp', 'Banco XP');
        await fillTerms(user);

        expect(
            await screen.findByText(
                'Coberto pelo FGC. Com este título, você terá R$ 50.000,00 no conglomerado XP, de um limite de R$ 250 mil.'
            )
        ).toBeInTheDocument();
        expect(api.fgcBodies).toEqual([{ issuerId: 'banco-xp', kind: 'cdb', valueMinor: 5000000 }]);
        expect(track).toHaveBeenCalledWith('fgc_preview_shown', { verdict: 'covered' });
    });

    it('acima do limite: diz quanto passa', async () => {
        mockAssetsApi({ fgc: fgcSimulation({ verdict: 'over_limit', totalAfterMinor: 30000000, overMinor: 5000000 }) });
        const { user }: AddAssetSetup = await openFixedIncome();
        await pickIssuer(user, 'xp', 'Banco XP');
        await fillTerms(user);

        expect(
            await screen.findByText(
                'Com este título, você terá R$ 300.000,00 no conglomerado XP: R$ 50.000,00 acima do limite de R$ 250 mil do FGC.'
            )
        ).toBeInTheDocument();
    });

    it('debênture: sem cobertura, com o nome do tipo', async () => {
        mockAssetsApi({ fgc: fgcSimulation({ verdict: 'not_covered_kind', groupName: 'Petrobras' }) });
        const { user }: AddAssetSetup = await openFixedIncome();
        await pickKind(user, 'Debênture');
        await pickIssuer(user, 'petro', 'Petrobras');
        await fillTerms(user);

        expect(await screen.findByText('Debênture não tem cobertura do FGC: o risco é só da empresa emissora.')).toBeInTheDocument();
    });

    it('emissor que não é associado ao FGC', async () => {
        mockAssetsApi({ fgc: fgcSimulation({ verdict: 'not_associated' }) });
        const { user }: AddAssetSetup = await openFixedIncome();
        await pickIssuer(user, 'xp', 'Banco XP');
        await fillTerms(user);

        expect(await screen.findByText('Este emissor não é associado ao FGC.')).toBeInTheDocument();
    });

    it('erro na simulação esconde a prévia e não bloqueia o cadastro', async () => {
        const api: AssetsApi = mockAssetsApi();
        server.use(http.post('*/portfolio/fgc/simulate', () => problem('fixed_income.unknown_issuer', 422)));
        const { user }: AddAssetSetup = await openFixedIncome();
        await pickIssuer(user, 'xp', 'Banco XP');
        await fillTerms(user);
        await screen.findByText('Valor estimado hoje');

        await waitFor(() => {
            expect(screen.queryByRole('status', { busy: true })).toBeNull();
        });
        expect(screen.queryByText(/FGC/)).toBeNull();
        await submitAdd(user);
        await waitFor(() => {
            expect(api.titleBodies).toHaveLength(1);
        });
    });
});

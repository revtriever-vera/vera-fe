import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { i18n } from '@/shared/lib/i18n';
import { customClass, rowOf, setup, type Setup } from '../../../../../test/helpers/class-manager';
import { defaultClasses, emptyHoldings, holding } from '../../../../../test/fixtures/portfolio';

describe('ClassManagerDialog: acessibilidade', () => {
    it('é um diálogo modal, fecha no Escape e o foco fica dentro dele', async () => {
        const { user, onOpenChange }: Setup = setup();
        await screen.findByText('Ações Brasil');
        const dialog: HTMLElement = screen.getByRole('dialog', { name: 'Gerenciar classes' });

        expect(dialog).toHaveAttribute('aria-modal', 'true');
        for (let index: number = 0; index < 30; index += 1) {
            await user.tab();
            expect(dialog).toContainElement(document.activeElement as HTMLElement);
        }
        await user.keyboard('{Escape}');

        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('volta o foco para dentro do diálogo ao andar para trás a partir do primeiro item', async () => {
        const { user }: Setup = setup();
        await screen.findByText('Ações Brasil');
        const dialog: HTMLElement = screen.getByRole('dialog', { name: 'Gerenciar classes' });
        await user.tab({ shift: true });

        expect(dialog).toContainElement(document.activeElement as HTMLElement);
    });

    it('Escape no formulário volta para a lista sem fechar o gerenciador', async () => {
        const { user, onOpenChange }: Setup = setup();
        await user.click(await screen.findByRole('button', { name: 'Nova classe' }));
        expect(screen.getByRole('textbox', { name: 'Nome da classe' })).toHaveFocus();
        await user.keyboard('{Escape}');

        expect(await screen.findByRole('dialog', { name: 'Gerenciar classes' })).toBeInTheDocument();
        expect(onOpenChange).not.toHaveBeenCalled();
    });

    it('troca a cor pelo teclado nas amostras', async () => {
        const { user }: Setup = setup();
        await user.click(await screen.findByRole('button', { name: 'Nova classe' }));
        screen.getByRole('radio', { name: 'Cor 9' }).focus();
        await user.keyboard('{ArrowRight>}');

        await waitFor(() => {
            expect(screen.getByRole('radio', { name: 'Cor 10' })).toBeChecked();
        });
        await user.keyboard('{/ArrowRight}');
        expect(screen.getAllByRole('radio')).toHaveLength(12);
    });

    it('oferece as ações da linha num menu e abre o formulário de renomear', async () => {
        const { user }: Setup = setup();
        const row: HTMLElement = await rowOf('Cripto');
        await user.click(within(row).getByRole('button', { name: 'Ações de Cripto' }));

        expect(await screen.findByRole('menuitem', { name: /Excluir Cripto/ })).toHaveAttribute('aria-disabled', 'true');
        await user.click(await screen.findByRole('menuitem', { name: 'Renomear Cripto' }));

        expect(await screen.findByRole('dialog', { name: 'Renomear Cripto' })).toBeInTheDocument();
    });

    it('o menu da linha junta e exclui uma classe vazia', async () => {
        const { user }: Setup = setup([...defaultClasses().data, customClass()], emptyHoldings());
        const row: HTMLElement = await rowOf('Previdência');
        await user.click(within(row).getByRole('button', { name: 'Ações de Previdência' }));
        await user.click(await screen.findByRole('menuitem', { name: 'Excluir Previdência' }));
        expect(await screen.findByRole('dialog', { name: 'Excluir a classe Previdência?' })).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Cancelar' }));
        await user.click(within(await rowOf('Previdência')).getByRole('button', { name: 'Ações de Previdência' }));
        await user.click(await screen.findByRole('menuitem', { name: 'Juntar Previdência em outra' }));

        expect(await screen.findByRole('dialog', { name: 'Juntar Previdência em outra classe' })).toBeInTheDocument();
    });
});

describe('ClassManagerDialog: inglês e plural', () => {
    it('traduz o diálogo, as classes padrão e a confirmação', async () => {
        await i18n.changeLanguage('en');
        const { user }: Setup = setup();
        await user.click(
            within(await rowOf('Brazilian REITs (FIIs)')).getByRole('button', { name: 'Merge Brazilian REITs (FIIs) into another' })
        );
        await user.click(screen.getByRole('combobox'));
        await user.click(screen.getByRole('option', { name: 'US REITs' }));
        await user.click(screen.getByRole('button', { name: 'Continue' }));

        expect(screen.getByRole('dialog', { name: 'Merge Brazilian REITs (FIIs) into US REITs?' })).toHaveTextContent(
            'The 2 assets in Brazilian REITs (FIIs) move to US REITs, the targets of both classes add up (7% + 8% = 15%)'
        );
    });

    it('usa o singular para um ativo e a frase sem ativos para classe vazia', async () => {
        const { user }: Setup = setup(
            [...defaultClasses().data, customClass({ id: 'class-a', name: 'A' }), customClass({ id: 'class-b', name: 'B' })],
            {
                ...emptyHoldings(),
                data: [holding({ id: 'only', classId: 'class-a' })]
            }
        );
        await user.click(within(await rowOf('A')).getByRole('button', { name: 'Juntar A em outra' }));
        await user.click(screen.getByRole('combobox'));
        await user.click(screen.getByRole('option', { name: 'B' }));
        await user.click(screen.getByRole('button', { name: 'Continuar' }));

        expect(screen.getByText(/O ativo de A passa para B/)).toBeInTheDocument();
    });
});

import { useState, type ReactElement } from 'react';
import { describe, expect, it, vi, type Mock } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../test/msw/server';
import { renderWithProviders } from '../../../../test/render';
import { categoryView, defaultCategories } from '../../../../test/fixtures/spending';
import { CategoryPicker, type CategoryPickerProps } from './category-picker';

function Harness(props: Partial<CategoryPickerProps>): ReactElement {
    const [value, setValue] = useState<string | null>(props.value ?? null);
    return (
        <CategoryPicker
            {...props}
            label="Categoria da transação"
            value={value}
            onChange={(id: string | null): void => {
                setValue(id);
                props.onChange?.(id);
            }}
        />
    );
}

async function openPicker(user: UserEvent): Promise<HTMLElement> {
    const trigger: HTMLElement = screen.getByRole('button', { name: 'Categoria da transação' });
    await vi.waitFor(() => {
        expect(trigger).toBeEnabled();
    });
    await user.click(trigger);
    return screen.findByRole('listbox', { name: 'Categorias' });
}

describe('CategoryPicker', () => {
    it('agrupa as categorias por natureza', async () => {
        const user: UserEvent = userEvent.setup();
        renderWithProviders(<Harness />);

        const list: HTMLElement = await openPicker(user);

        expect(within(list).getByRole('group', { name: 'Gastos' })).toBeInTheDocument();
        expect(within(list).getByRole('group', { name: 'Entradas' })).toBeInTheDocument();
        expect(within(list).getByRole('group', { name: 'Transferências' })).toBeInTheDocument();
        expect(within(list).getAllByRole('option')).toHaveLength(17);
    });

    it('escolhe uma categoria com o clique e fecha a lista', async () => {
        const user: UserEvent = userEvent.setup();
        const onChange: Mock = vi.fn();
        renderWithProviders(<Harness onChange={onChange} />);

        const list: HTMLElement = await openPicker(user);
        await user.click(within(list).getByRole('option', { name: /Mercado/ }));

        expect(onChange).toHaveBeenCalledWith('cat-groceries');
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Categoria da transação' })).toHaveTextContent('Mercado');
    });

    it('filtra pela busca', async () => {
        const user: UserEvent = userEvent.setup();
        renderWithProviders(<Harness />);
        await openPicker(user);

        await user.type(screen.getByRole('combobox', { name: 'Buscar entre as categorias' }), 'educa');

        const list: HTMLElement = screen.getByRole('listbox', { name: 'Categorias' });
        expect(within(list).getAllByRole('option')).toHaveLength(1);
        expect(within(list).getByRole('option', { name: /Educação/ })).toBeInTheDocument();
    });

    it('avisa que renda não vale numa saída e não deixa escolher', async () => {
        const user: UserEvent = userEvent.setup();
        const onChange: Mock = vi.fn();
        renderWithProviders(<Harness direction="out" onChange={onChange} />);

        const list: HTMLElement = await openPicker(user);
        const income: HTMLElement = within(list).getByRole('option', { name: /Renda/ });
        await user.click(income);

        expect(income).toHaveAttribute('aria-disabled', 'true');
        expect(within(income).getByText('Categoria de entrada não vale para um gasto')).toBeInTheDocument();
        expect(onChange).not.toHaveBeenCalled();
    });

    it('funciona pelo teclado: setas e Enter', async () => {
        const user: UserEvent = userEvent.setup();
        const onChange: Mock = vi.fn();
        renderWithProviders(<Harness onChange={onChange} />);
        await openPicker(user);

        await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');

        expect(onChange).toHaveBeenCalledWith('cat-education');
    });

    it('a seta para cima a partir do começo vai para a última opção', async () => {
        const user: UserEvent = userEvent.setup();
        const onChange: Mock = vi.fn();
        renderWithProviders(<Harness onChange={onChange} />);
        await openPicker(user);

        await user.keyboard('{ArrowUp}{Enter}');

        expect(onChange).toHaveBeenCalledWith('cat-investments');
    });

    it('oferece a opção sem categoria quando permitida', async () => {
        const user: UserEvent = userEvent.setup();
        const onChange: Mock = vi.fn();
        renderWithProviders(<Harness allowNone value="cat-groceries" onChange={onChange} />);

        const list: HTMLElement = await openPicker(user);
        await user.click(within(list).getByRole('option', { name: /Nenhuma categoria/ }));

        expect(onChange).toHaveBeenCalledWith(null);
    });

    it('mostra o nome das categorias do usuário e o estado vazio da busca', async () => {
        const user: UserEvent = userEvent.setup();
        server.use(
            http.get('*/spending/categories', () =>
                HttpResponse.json({ categories: [...defaultCategories().categories, categoryView({ id: 'cat-pets', name: 'Pets' })] })
            )
        );
        renderWithProviders(<Harness />);
        await vi.waitFor(() => {
            expect(screen.getByRole('button', { name: 'Categoria da transação' })).toBeEnabled();
        });
        await user.click(screen.getByRole('button', { name: 'Categoria da transação' }));
        expect(await screen.findByRole('option', { name: /Pets/ })).toBeInTheDocument();

        await user.type(screen.getByRole('combobox', { name: 'Buscar entre as categorias' }), 'zzz');

        expect(screen.getByText('Nenhuma categoria encontrada')).toBeInTheDocument();
    });

    it('fica desabilitado enquanto as categorias carregam', () => {
        renderWithProviders(<Harness />);

        expect(screen.getByRole('button', { name: 'Categoria da transação' })).toBeDisabled();
    });
});

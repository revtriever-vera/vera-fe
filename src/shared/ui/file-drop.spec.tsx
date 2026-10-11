import { describe, expect, it, vi, type Mock } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FileDrop } from './file-drop';

const ACCEPT: Readonly<Record<string, readonly string[]>> = { 'image/png': ['.png'] };

describe('FileDrop', () => {
    it('accepts a picked file through the hidden input', async () => {
        const onPicked: Mock = vi.fn();
        render(
            <FileDrop
                label="Arquivo do cabeçalho"
                hint="PNG até 5 MB"
                accept={ACCEPT}
                maxSizeBytes={5 * 1024 * 1024}
                fileName={null}
                onPicked={onPicked}
                onClear={vi.fn()}
            />
        );
        expect(screen.getByText('PNG até 5 MB')).toBeInTheDocument();
        const input: HTMLElement = screen.getByLabelText('Arquivo do cabeçalho');
        const file: File = new File(['png-bytes'], 'logo.png', { type: 'image/png' });
        fireEvent.change(input, { target: { files: [file] } });
        await waitFor((): void => {
            expect(onPicked).toHaveBeenCalledWith(file);
        });
    });

    it('avisa quando o arquivo é recusado pelo formato', async () => {
        const { container } = render(
            <FileDrop label="Arquivo" hint="PNG" accept={ACCEPT} maxSizeBytes={1024} fileName={null} onPicked={vi.fn()} onClear={vi.fn()} />
        );
        const input: HTMLElement = screen.getByLabelText('Arquivo');
        const file: File = new File(['pdf-bytes'], 'arquivo.pdf', { type: 'application/pdf' });
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor((): void => {
            expect(container.querySelector('.text-critical')).not.toBeNull();
        });
    });

    it('shows the picked state with the clear action', () => {
        const onClear: Mock = vi.fn();
        render(
            <FileDrop
                label="Arquivo"
                hint="PNG"
                accept={ACCEPT}
                maxSizeBytes={1024}
                fileName="logo.png"
                onPicked={vi.fn()}
                onClear={onClear}
            />
        );
        expect(screen.getByText('logo.png')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Trocar' }));
        expect(onClear).toHaveBeenCalled();
    });
});

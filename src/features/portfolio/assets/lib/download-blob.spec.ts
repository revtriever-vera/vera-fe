import { describe, expect, it, vi, type Mock, type MockInstance } from 'vitest';
import { downloadBlob } from './download-blob';

describe('downloadBlob', () => {
    it('cria o URL, clica no link com o nome e revoga depois', () => {
        vi.useFakeTimers();
        const create: Mock = vi.fn(() => 'blob:fake');
        const revoke: Mock = vi.fn();
        vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke }));
        const click: MockInstance = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
            this: HTMLAnchorElement
        ): void {
            expect(this.download).toBe('a.xlsx');
            expect(this.href).toBe('blob:fake');
        });

        downloadBlob(new Blob(['x']), 'a.xlsx');
        vi.runAllTimers();

        expect(click).toHaveBeenCalledTimes(1);
        expect(revoke).toHaveBeenCalledWith('blob:fake');
        expect(document.querySelector('a[download]')).toBeNull();
        click.mockRestore();
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });
});

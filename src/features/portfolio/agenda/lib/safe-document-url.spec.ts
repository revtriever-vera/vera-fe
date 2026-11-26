import { describe, expect, it } from 'vitest';
import { safeDocumentUrl } from './safe-document-url';

describe('safeDocumentUrl', () => {
    it('aceita http e https', () => {
        expect(safeDocumentUrl('https://example.com/a?id=1')).toBe('https://example.com/a?id=1');
        expect(safeDocumentUrl('http://example.com/a')).toBe('http://example.com/a');
    });

    it('recusa nulo, outros protocolos e texto que não é endereço', () => {
        expect(safeDocumentUrl(null)).toBeNull();
        expect(safeDocumentUrl('javascript:alert(1)')).toBeNull();
        expect(safeDocumentUrl('não é endereço')).toBeNull();
    });
});

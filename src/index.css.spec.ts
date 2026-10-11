import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css: string = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');

const TOKENS: readonly string[] = [
    'canvas',
    'surface',
    'surface-muted',
    'border',
    'border-strong',
    'content',
    'content-muted',
    'content-subtle',
    'accent',
    'accent-contrast',
    'positive',
    'caution',
    'critical',
    'info'
];

const CLASS_TOKENS: readonly string[] = Array.from({ length: 12 }, (_: unknown, index: number): string => `class-${String(index + 1)}`);

describe('index.css', () => {
    it.each(TOKENS)('define o token --color-%s', (token: string) => {
        expect(css).toMatch(new RegExp(`--color-${token}:`));
    });

    it.each(CLASS_TOKENS)('define o token --color-%s e o fundo suave dele', (token: string) => {
        expect(css).toMatch(new RegExp(`--color-${token}:\\s*#[0-9a-f]{6};`));
        expect(css).toMatch(
            new RegExp(`--color-${token}-soft:\\s*color-mix\\(in srgb, var\\(--color-${token}\\) 15%, var\\(--color-surface\\)\\);`)
        );
    });

    it('usa o rosa da Vera como cor base', () => {
        expect(css).toMatch(/--color-accent:\s*#e0407b;/);
    });

    it('usa Nunito como fonte', () => {
        expect(css).toMatch(/--font-sans:\s*'Nunito Variable'/);
        expect(css).toMatch(/--font-display:\s*'Nunito Variable'/);
    });

    it('não tem resquício de superfície, modo escuro ou paleta de provedor', () => {
        expect(css).not.toMatch(/data-surface|\.dark|@custom-variant|--color-wa-|--color-brand/);
    });
});

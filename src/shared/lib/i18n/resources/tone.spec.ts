import { describe, expect, it } from 'vitest';

type Dictionary = { readonly [key: string]: string | Dictionary };

const FILES: Readonly<Record<string, unknown>> = import.meta.glob('./pt-BR/*.json', { eager: true, import: 'default' });

function leaves(node: string | Dictionary, path: string): readonly (readonly [string, string])[] {
    if (typeof node === 'string') {
        return [[path, node]];
    }
    return Object.entries(node).flatMap(([key, value]: [string, string | Dictionary]) => leaves(value, `${path}.${key}`));
}

const STRINGS: readonly (readonly [string, string])[] = Object.entries(FILES).flatMap(([file, content]: [string, unknown]) =>
    leaves(content as Dictionary, file)
);

const FORBIDDEN: readonly RegExp[] = [
    /de verdade/i,
    /inteligente/i,
    /sem problema/i,
    /descubra/i,
    /jornada/i,
    /sozinh[oa]s?/i,
    /!/,
    /\s—\s/,
    /^Patrim[ôo]nio$/,
    /^Aporte inteligente$/i
];

describe('tom de voz nos textos em pt-BR', () => {
    it('carrega os dicionários', () => {
        expect(STRINGS.length).toBeGreaterThan(500);
    });

    it.each(FORBIDDEN.map((rule: RegExp): [string, RegExp] => [String(rule), rule]))(
        'nenhum texto casa %s',
        (_name: string, rule: RegExp) => {
            const offenders: readonly string[] = STRINGS.filter(([, value]: readonly [string, string]) => rule.test(value)).map(
                ([path, value]: readonly [string, string]) => `${path}: ${value}`
            );

            expect(offenders).toEqual([]);
        }
    );
});

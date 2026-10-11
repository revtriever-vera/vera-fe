import { describe, expect, it } from 'vitest';
import ptBRCommon from './pt-BR/common.json';
import enCommon from './en/common.json';
import ptBRAuth from './pt-BR/auth.json';
import enAuth from './en/auth.json';

type TranslationNode = string | { readonly [key: string]: TranslationNode };

function flattenKeys(node: TranslationNode, prefix: string): string[] {
    if (typeof node === 'string') {
        return [prefix];
    }
    return Object.keys(node).flatMap((key: string): string[] =>
        flattenKeys(node[key] as TranslationNode, prefix === '' ? key : `${prefix}.${key}`)
    );
}

function sortedKeys(resource: TranslationNode): string[] {
    return flattenKeys(resource, '').sort();
}

interface NamespaceFixture {
    readonly name: string;
    readonly ptBR: TranslationNode;
    readonly en: TranslationNode;
}

const NAMESPACES: readonly NamespaceFixture[] = [
    { name: 'common', ptBR: ptBRCommon, en: enCommon },
    { name: 'auth', ptBR: ptBRAuth, en: enAuth }
];

describe('paridade de chaves entre os namespaces de tradução', () => {
    it.each(NAMESPACES)('$name: pt-BR e en têm exatamente o mesmo conjunto de chaves', ({ ptBR, en }): void => {
        expect(sortedKeys(en)).toEqual(sortedKeys(ptBR));
    });
});

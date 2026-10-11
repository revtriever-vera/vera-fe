import { describe, expect, it } from 'vitest';
import ptBRCommon from './pt-BR/common.json';
import enCommon from './en/common.json';
import ptBRAuth from './pt-BR/auth.json';
import enAuth from './en/auth.json';
import ptBRPortfolio from './pt-BR/portfolio.json';
import enPortfolio from './en/portfolio.json';
import ptBRPortfolioOverview from './pt-BR/portfolioOverview.json';
import enPortfolioOverview from './en/portfolioOverview.json';
import ptBRPortfolioAssets from './pt-BR/portfolioAssets.json';
import enPortfolioAssets from './en/portfolioAssets.json';
import ptBRPortfolioTargets from './pt-BR/portfolioTargets.json';
import enPortfolioTargets from './en/portfolioTargets.json';
import ptBRPortfolioContribution from './pt-BR/portfolioContribution.json';
import enPortfolioContribution from './en/portfolioContribution.json';

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
    { name: 'auth', ptBR: ptBRAuth, en: enAuth },
    { name: 'portfolio', ptBR: ptBRPortfolio, en: enPortfolio },
    { name: 'portfolioOverview', ptBR: ptBRPortfolioOverview, en: enPortfolioOverview },
    { name: 'portfolioAssets', ptBR: ptBRPortfolioAssets, en: enPortfolioAssets },
    { name: 'portfolioTargets', ptBR: ptBRPortfolioTargets, en: enPortfolioTargets },
    { name: 'portfolioContribution', ptBR: ptBRPortfolioContribution, en: enPortfolioContribution }
];

describe('paridade de chaves entre os namespaces de tradução', () => {
    it.each(NAMESPACES)('$name: pt-BR e en têm exatamente o mesmo conjunto de chaves', ({ ptBR, en }): void => {
        expect(sortedKeys(en)).toEqual(sortedKeys(ptBR));
    });
});

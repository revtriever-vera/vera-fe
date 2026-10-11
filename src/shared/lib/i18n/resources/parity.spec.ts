import { describe, expect, it } from 'vitest';
import ptBRCommon from './pt-BR/common.json';
import enCommon from './en/common.json';
import ptBRAuth from './pt-BR/auth.json';
import enAuth from './en/auth.json';
import ptBRAccount from './pt-BR/account.json';
import enAccount from './en/account.json';
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
import ptBROnboarding from './pt-BR/onboarding.json';
import enOnboarding from './en/onboarding.json';

import ptBRSpending from './pt-BR/spending.json';
import enSpending from './en/spending.json';
import ptBRSpendingSummary from './pt-BR/spendingSummary.json';
import enSpendingSummary from './en/spendingSummary.json';
import ptBRSpendingTransactions from './pt-BR/spendingTransactions.json';
import enSpendingTransactions from './en/spendingTransactions.json';
import ptBRSpendingCuts from './pt-BR/spendingCuts.json';
import enSpendingCuts from './en/spendingCuts.json';
import ptBRSpendingConnections from './pt-BR/spendingConnections.json';
import enSpendingConnections from './en/spendingConnections.json';
import ptBRSpendingImports from './pt-BR/spendingImports.json';
import enSpendingImports from './en/spendingImports.json';
import ptBRSpendingRules from './pt-BR/spendingRules.json';
import enSpendingRules from './en/spendingRules.json';

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
    { name: 'account', ptBR: ptBRAccount, en: enAccount },
    { name: 'portfolio', ptBR: ptBRPortfolio, en: enPortfolio },
    { name: 'portfolioOverview', ptBR: ptBRPortfolioOverview, en: enPortfolioOverview },
    { name: 'portfolioAssets', ptBR: ptBRPortfolioAssets, en: enPortfolioAssets },
    { name: 'portfolioTargets', ptBR: ptBRPortfolioTargets, en: enPortfolioTargets },
    { name: 'portfolioContribution', ptBR: ptBRPortfolioContribution, en: enPortfolioContribution },
    { name: 'onboarding', ptBR: ptBROnboarding, en: enOnboarding },
    { name: 'spending', ptBR: ptBRSpending, en: enSpending },
    { name: 'spendingSummary', ptBR: ptBRSpendingSummary, en: enSpendingSummary },
    { name: 'spendingTransactions', ptBR: ptBRSpendingTransactions, en: enSpendingTransactions },
    { name: 'spendingCuts', ptBR: ptBRSpendingCuts, en: enSpendingCuts },
    { name: 'spendingConnections', ptBR: ptBRSpendingConnections, en: enSpendingConnections },
    { name: 'spendingImports', ptBR: ptBRSpendingImports, en: enSpendingImports },
    { name: 'spendingRules', ptBR: ptBRSpendingRules, en: enSpendingRules }
];

describe('paridade de chaves entre os namespaces de tradução', () => {
    it.each(NAMESPACES)('$name: pt-BR e en têm exatamente o mesmo conjunto de chaves', ({ ptBR, en }): void => {
        expect(sortedKeys(en)).toEqual(sortedKeys(ptBR));
    });
});

import { describe, expect, it } from 'vitest';
import ptBRCommon from './pt-BR/common.json';
import enCommon from './en/common.json';
import ptBRAuth from './pt-BR/auth.json';
import enAuth from './en/auth.json';
import ptBRNotices from './pt-BR/notices.json';
import enNotices from './en/notices.json';
import ptBRAccount from './pt-BR/account.json';
import ptBRMembers from './pt-BR/members.json';
import ptBRIntegrations from './pt-BR/integrations.json';
import ptBRWhatsapp from './pt-BR/whatsapp.json';
import ptBRCalendar from './pt-BR/calendar.json';
import enAccount from './en/account.json';
import enMembers from './en/members.json';
import enIntegrations from './en/integrations.json';
import enWhatsapp from './en/whatsapp.json';
import enCalendar from './en/calendar.json';
import ptBRPortfolio from './pt-BR/portfolio.json';
import enPortfolio from './en/portfolio.json';
import ptBRPortfolioOverview from './pt-BR/portfolioOverview.json';
import enPortfolioOverview from './en/portfolioOverview.json';
import ptBRPortfolioAssets from './pt-BR/portfolioAssets.json';
import enPortfolioAssets from './en/portfolioAssets.json';
import ptBRPortfolioImports from './pt-BR/portfolioImports.json';
import enPortfolioImports from './en/portfolioImports.json';
import ptBRPortfolioFixedIncome from './pt-BR/portfolioFixedIncome.json';
import enPortfolioFixedIncome from './en/portfolioFixedIncome.json';
import ptBRPortfolioTargets from './pt-BR/portfolioTargets.json';
import enPortfolioTargets from './en/portfolioTargets.json';
import ptBRPortfolioContribution from './pt-BR/portfolioContribution.json';
import ptBRPortfolioGoals from './pt-BR/portfolioGoals.json';
import enPortfolioGoals from './en/portfolioGoals.json';
import ptBRPortfolioReview from './pt-BR/portfolioReview.json';
import enPortfolioReview from './en/portfolioReview.json';
import ptBRSpendingRecurring from './pt-BR/spendingRecurring.json';
import enSpendingRecurring from './en/spendingRecurring.json';
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
import ptBRSettings from './pt-BR/settings.json';
import enSettings from './en/settings.json';
import ptBRBilling from './pt-BR/billing.json';
import enBilling from './en/billing.json';
import ptBRSummaries from './pt-BR/summaries.json';
import enSummaries from './en/summaries.json';
import ptBRAdmin from './pt-BR/admin.json';
import enAdmin from './en/admin.json';
import ptBRAssistant from './pt-BR/assistant.json';
import enAssistant from './en/assistant.json';

const NAMESPACES: readonly NamespaceFixture[] = [
    { name: 'common', ptBR: ptBRCommon, en: enCommon },
    { name: 'auth', ptBR: ptBRAuth, en: enAuth },
    { name: 'account', ptBR: ptBRAccount, en: enAccount },
    { name: 'notices', ptBR: ptBRNotices, en: enNotices },
    { name: 'members', ptBR: ptBRMembers, en: enMembers },
    { name: 'integrations', ptBR: ptBRIntegrations, en: enIntegrations },
    { name: 'whatsapp', ptBR: ptBRWhatsapp, en: enWhatsapp },
    { name: 'calendar', ptBR: ptBRCalendar, en: enCalendar },
    { name: 'portfolio', ptBR: ptBRPortfolio, en: enPortfolio },
    { name: 'portfolioOverview', ptBR: ptBRPortfolioOverview, en: enPortfolioOverview },
    { name: 'portfolioAssets', ptBR: ptBRPortfolioAssets, en: enPortfolioAssets },
    { name: 'portfolioImports', ptBR: ptBRPortfolioImports, en: enPortfolioImports },
    { name: 'portfolioFixedIncome', ptBR: ptBRPortfolioFixedIncome, en: enPortfolioFixedIncome },
    { name: 'portfolioTargets', ptBR: ptBRPortfolioTargets, en: enPortfolioTargets },
    { name: 'portfolioContribution', ptBR: ptBRPortfolioContribution, en: enPortfolioContribution },
    { name: 'portfolioGoals', ptBR: ptBRPortfolioGoals, en: enPortfolioGoals },
    { name: 'portfolioReview', ptBR: ptBRPortfolioReview, en: enPortfolioReview },
    { name: 'spendingRecurring', ptBR: ptBRSpendingRecurring, en: enSpendingRecurring },
    { name: 'onboarding', ptBR: ptBROnboarding, en: enOnboarding },
    { name: 'spending', ptBR: ptBRSpending, en: enSpending },
    { name: 'spendingSummary', ptBR: ptBRSpendingSummary, en: enSpendingSummary },
    { name: 'spendingTransactions', ptBR: ptBRSpendingTransactions, en: enSpendingTransactions },
    { name: 'spendingCuts', ptBR: ptBRSpendingCuts, en: enSpendingCuts },
    { name: 'spendingConnections', ptBR: ptBRSpendingConnections, en: enSpendingConnections },
    { name: 'spendingImports', ptBR: ptBRSpendingImports, en: enSpendingImports },
    { name: 'spendingRules', ptBR: ptBRSpendingRules, en: enSpendingRules },
    { name: 'settings', ptBR: ptBRSettings, en: enSettings },
    { name: 'billing', ptBR: ptBRBilling, en: enBilling },
    { name: 'summaries', ptBR: ptBRSummaries, en: enSummaries },
    { name: 'admin', ptBR: ptBRAdmin, en: enAdmin },
    { name: 'assistant', ptBR: ptBRAssistant, en: enAssistant }
];

describe('paridade de chaves entre os namespaces de tradução', () => {
    it.each(NAMESPACES)('$name: pt-BR e en têm exatamente o mesmo conjunto de chaves', ({ ptBR, en }): void => {
        expect(sortedKeys(en)).toEqual(sortedKeys(ptBR));
    });
});

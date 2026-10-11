import type ptBRCommon from './shared/lib/i18n/resources/pt-BR/common.json';
import type ptBRAuth from './shared/lib/i18n/resources/pt-BR/auth.json';
import type ptBRPortfolio from './shared/lib/i18n/resources/pt-BR/portfolio.json';
import type ptBRPortfolioOverview from './shared/lib/i18n/resources/pt-BR/portfolioOverview.json';
import type ptBRPortfolioAssets from './shared/lib/i18n/resources/pt-BR/portfolioAssets.json';
import type ptBRPortfolioTargets from './shared/lib/i18n/resources/pt-BR/portfolioTargets.json';
import type ptBRPortfolioContribution from './shared/lib/i18n/resources/pt-BR/portfolioContribution.json';

declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'common';
        returnNull: false;
        resources: {
            common: typeof ptBRCommon;
            auth: typeof ptBRAuth;
            portfolio: typeof ptBRPortfolio;
            portfolioOverview: typeof ptBRPortfolioOverview;
            portfolioAssets: typeof ptBRPortfolioAssets;
            portfolioTargets: typeof ptBRPortfolioTargets;
            portfolioContribution: typeof ptBRPortfolioContribution;
        };
    }
}

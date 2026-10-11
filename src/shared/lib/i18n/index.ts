import i18next, { type i18n as I18nInstance } from 'i18next';
import { initReactI18next, useTranslation, type UseTranslationResponse } from 'react-i18next';
import ptBRCommon from './resources/pt-BR/common.json';
import enCommon from './resources/en/common.json';
import ptBRAuth from './resources/pt-BR/auth.json';
import enAuth from './resources/en/auth.json';
import ptBRAccount from './resources/pt-BR/account.json';
import enAccount from './resources/en/account.json';
import ptBRPortfolio from './resources/pt-BR/portfolio.json';
import enPortfolio from './resources/en/portfolio.json';
import ptBRPortfolioOverview from './resources/pt-BR/portfolioOverview.json';
import enPortfolioOverview from './resources/en/portfolioOverview.json';
import ptBRPortfolioAssets from './resources/pt-BR/portfolioAssets.json';
import enPortfolioAssets from './resources/en/portfolioAssets.json';
import ptBRPortfolioTargets from './resources/pt-BR/portfolioTargets.json';
import enPortfolioTargets from './resources/en/portfolioTargets.json';
import ptBRPortfolioContribution from './resources/pt-BR/portfolioContribution.json';
import enPortfolioContribution from './resources/en/portfolioContribution.json';
import ptBROnboarding from './resources/pt-BR/onboarding.json';
import enOnboarding from './resources/en/onboarding.json';
import ptBRSpending from './resources/pt-BR/spending.json';
import enSpending from './resources/en/spending.json';
import ptBRSpendingSummary from './resources/pt-BR/spendingSummary.json';
import enSpendingSummary from './resources/en/spendingSummary.json';
import ptBRSpendingTransactions from './resources/pt-BR/spendingTransactions.json';
import enSpendingTransactions from './resources/en/spendingTransactions.json';
import ptBRSpendingCuts from './resources/pt-BR/spendingCuts.json';
import enSpendingCuts from './resources/en/spendingCuts.json';
import ptBRSpendingConnections from './resources/pt-BR/spendingConnections.json';
import enSpendingConnections from './resources/en/spendingConnections.json';
import ptBRSpendingImports from './resources/pt-BR/spendingImports.json';
import enSpendingImports from './resources/en/spendingImports.json';
import ptBRSpendingRules from './resources/pt-BR/spendingRules.json';
import enSpendingRules from './resources/en/spendingRules.json';
import { DEFAULT_LOCALE, resolveLocale, type SupportedLocale } from './resolve-locale';

type CommonResource = typeof ptBRCommon;
type AuthResource = typeof ptBRAuth;

type LocaleResources = {
    readonly common: CommonResource;
    readonly auth: AuthResource;
    readonly account: typeof ptBRAccount;
    readonly portfolio: typeof ptBRPortfolio;
    readonly portfolioOverview: typeof ptBRPortfolioOverview;
    readonly portfolioAssets: typeof ptBRPortfolioAssets;
    readonly portfolioTargets: typeof ptBRPortfolioTargets;
    readonly portfolioContribution: typeof ptBRPortfolioContribution;
    readonly onboarding: typeof ptBROnboarding;
    readonly spending: typeof ptBRSpending;
    readonly spendingSummary: typeof ptBRSpendingSummary;
    readonly spendingTransactions: typeof ptBRSpendingTransactions;
    readonly spendingCuts: typeof ptBRSpendingCuts;
    readonly spendingConnections: typeof ptBRSpendingConnections;
    readonly spendingImports: typeof ptBRSpendingImports;
    readonly spendingRules: typeof ptBRSpendingRules;
};

const resources: Record<SupportedLocale, LocaleResources> = {
    'pt-BR': {
        common: ptBRCommon,
        auth: ptBRAuth,
        account: ptBRAccount,
        portfolio: ptBRPortfolio,
        portfolioOverview: ptBRPortfolioOverview,
        portfolioAssets: ptBRPortfolioAssets,
        portfolioTargets: ptBRPortfolioTargets,
        portfolioContribution: ptBRPortfolioContribution,
        onboarding: ptBROnboarding,
        spending: ptBRSpending,
        spendingSummary: ptBRSpendingSummary,
        spendingTransactions: ptBRSpendingTransactions,
        spendingCuts: ptBRSpendingCuts,
        spendingConnections: ptBRSpendingConnections,
        spendingImports: ptBRSpendingImports,
        spendingRules: ptBRSpendingRules
    },
    en: {
        common: enCommon,
        auth: enAuth,
        account: enAccount,
        portfolio: enPortfolio,
        portfolioOverview: enPortfolioOverview,
        portfolioAssets: enPortfolioAssets,
        portfolioTargets: enPortfolioTargets,
        portfolioContribution: enPortfolioContribution,
        onboarding: enOnboarding,
        spending: enSpending,
        spendingSummary: enSpendingSummary,
        spendingTransactions: enSpendingTransactions,
        spendingCuts: enSpendingCuts,
        spendingConnections: enSpendingConnections,
        spendingImports: enSpendingImports,
        spendingRules: enSpendingRules
    }
};

function initialLocale(): SupportedLocale {
    const navigatorLanguage: string | null = typeof navigator === 'undefined' ? null : navigator.language;
    return resolveLocale({ navigatorLanguage });
}

void i18next.use(initReactI18next).init({
    resources,
    lng: initialLocale(),
    fallbackLng: DEFAULT_LOCALE,
    ns: [
        'common',
        'auth',
        'account',
        'portfolio',
        'portfolioOverview',
        'portfolioAssets',
        'portfolioTargets',
        'portfolioContribution',
        'onboarding',
        'spending',
        'spendingSummary',
        'spendingTransactions',
        'spendingCuts',
        'spendingConnections',
        'spendingImports',
        'spendingRules'
    ],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    returnNull: false
});

export const i18n: I18nInstance = i18next;

export function useLocale(): SupportedLocale {
    const { i18n: instance }: UseTranslationResponse<'common', undefined> = useTranslation();
    return resolveLocale({ navigatorLanguage: instance.language });
}

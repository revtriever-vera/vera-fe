import type { ApiPaths } from '@/shared/lib/api/api-paths';

type Json<Operation> = Operation extends { responses: infer Responses }
    ? Responses extends { 200: { content: { 'application/json': infer Body } } }
        ? Body
        : Responses extends { 201: { content: { 'application/json': infer Body } } }
          ? Body
          : never
    : never;

export type CategoriesResponse = Json<ApiPaths['/spending/categories']['get']>;
export type CategoryView = CategoriesResponse['categories'][number];
export type IconKey = CategoryView['icon'];
export type CategoryKind = CategoryView['kind'];
export type CategoryFlexibility = NonNullable<CategoryView['flexibility']>;
export type CreateCategoryBody = NonNullable<ApiPaths['/spending/categories']['post']['requestBody']>['content']['application/json'];
export type UpdateCategoryBody = NonNullable<ApiPaths['/spending/categories/{id}']['patch']['requestBody']>['content']['application/json'];

export type RulesResponse = Json<ApiPaths['/spending/rules']['get']>;
export type RuleView = RulesResponse['rules'][number];
export type CreateRuleBody = NonNullable<ApiPaths['/spending/rules']['post']['requestBody']>['content']['application/json'];
export type RuleResult = Json<ApiPaths['/spending/rules']['post']>;
export type RulePreview = Json<ApiPaths['/spending/rules/preview']['post']>;
export type RulePreviewInput = NonNullable<ApiPaths['/spending/rules/preview']['post']['requestBody']>['content']['application/json'];

export type TransactionsResponse = Json<ApiPaths['/spending/transactions']['get']>;
export type TransactionView = TransactionsResponse['data'][number];
export type TransactionsQuery = NonNullable<ApiPaths['/spending/transactions']['get']['parameters']['query']>;
export type CategorySource = TransactionView['categorySource'];
export type RecategorizeBody = NonNullable<ApiPaths['/spending/transactions/{id}']['patch']['requestBody']>['content']['application/json'];
export type RecategorizeResult = Json<ApiPaths['/spending/transactions/{id}']['patch']>;
export type UncategorizedCount = Json<ApiPaths['/spending/transactions/uncategorized-count']['get']>;

export type AccountsResponse = Json<ApiPaths['/spending/accounts']['get']>;
export type AccountView = AccountsResponse['accounts'][number];

export type MonthlySummary = Json<ApiPaths['/spending/summary']['get']>;
export type SummaryCategoryRow = MonthlySummary['categories'][number];
export type SpendingSettings = Json<ApiPaths['/spending/settings']['get']>;
export type UpdateSpendingSettings = NonNullable<ApiPaths['/spending/settings']['put']['requestBody']>['content']['application/json'];
export type IncomeMode = SpendingSettings['incomeMode'];

export type CutsResponse = Json<ApiPaths['/spending/cuts']['get']>;
export type CutSuggestion = CutsResponse['suggestions'][number];
export type CutsStatus = CutsResponse['status'];

export type ConnectionsResponse = Json<ApiPaths['/spending/connections']['get']>;
export type ConnectionView = ConnectionsResponse['connections'][number];
export type CredentialsView = ConnectionsResponse['credentials'];

export type ImportsResponse = Json<ApiPaths['/spending/imports']['get']>;
export type ImportView = ImportsResponse['data'][number];
export type ImportFormat = ImportView['format'];
export type ImportPreview = Json<ApiPaths['/spending/imports/preview']['post']>;

export type CategoryTone = 'flexible' | 'fixed' | 'uncategorized' | 'income' | 'transfer';

export const CATEGORY_KIND = {
    expense: 'expense',
    income: 'income',
    transfer: 'transfer'
} as const;

export const INCOME_MODES = ['transactions', 'declared'] as const satisfies readonly IncomeMode[];

export const SPENDING_CURRENCY: string = 'BRL';

export const FLEXIBILITY = {
    fixed: 'fixed',
    flexible: 'flexible'
} as const;

export const ICON_KEYS = [
    'Home',
    'BookOpen',
    'HeartPulse',
    'Wrench',
    'Landmark',
    'ShoppingCart',
    'UtensilsCrossed',
    'Car',
    'Film',
    'Repeat',
    'ShoppingBag',
    'CircleEllipsis',
    'TrendingUp',
    'PlusCircle',
    'ArrowLeftRight',
    'CreditCard',
    'PiggyBank',
    'Coffee',
    'Dumbbell',
    'PawPrint',
    'Plane',
    'Gift',
    'Baby',
    'Briefcase'
] as const satisfies readonly IconKey[];

export const SYSTEM_CATEGORY_KEYS = [
    'housing',
    'education',
    'health',
    'home_services',
    'taxes_fees',
    'groceries',
    'eating_out',
    'transport',
    'leisure',
    'subscriptions',
    'shopping',
    'other_expenses',
    'income',
    'other_income',
    'own_transfer',
    'card_payment',
    'investments'
] as const;

export type SystemCategoryKey = (typeof SYSTEM_CATEGORY_KEYS)[number];

export type AuthProviderName = 'google' | 'facebook';
export type OnboardingStepName = 'welcome' | 'assets' | 'banks' | 'done';
export type AssetTypeName = 'fixed_income' | 'tesouro' | 'acoes_br' | 'fii' | 'acoes_eua' | 'reits' | 'cripto';
export type AddAssetSource = 'search' | 'fixed_income';
export type ExportFormatName = 'csv' | 'xlsx';
export type CurrencyCode = 'BRL' | 'USD';
export type SpendingImportFormatName = 'ofx' | 'csv_nubank_card' | 'csv_nubank_account' | 'csv_generic';
export type SpendingFlexibilityName = 'fixed' | 'flexible';
export type SpendingRuleMatchName = 'description' | 'contains';
export type SpendingCutsStatusName = 'no_data' | 'no_income' | 'goal_met' | 'cut_suggested' | 'exceeds_flexible';

export interface AnalyticsEventMap {
    auth_screen_viewed: undefined;
    auth_started: { provider: AuthProviderName };
    auth_authenticated: { provider: AuthProviderName; isNewAccount: boolean };
    auth_failed: { provider: AuthProviderName; code: string };
    auth_signed_out: undefined;
    account_export_requested: undefined;
    account_delete_opened: undefined;
    account_deleted: undefined;
    language_changed: { locale: 'pt-BR' | 'en' };
    onboarding_started: undefined;
    onboarding_step_viewed: { step: OnboardingStepName };
    onboarding_step_completed: { step: OnboardingStepName };
    onboarding_step_skipped: { step: OnboardingStepName };
    onboarding_dismissed: { at: OnboardingStepName };
    onboarding_finished: undefined;
    onboarding_connections_opened: undefined;
    onboarding_pluggy_link_clicked: { target: 'meu' | 'dashboard' };
    sample_data_loaded: { source: 'empty_state' | 'welcome'; screen: string };
    sample_data_cleared: undefined;
    portfolio_export_downloaded: { format: ExportFormatName };
    portfolio_asset_added: { type: AssetTypeName; source: AddAssetSource };
    portfolio_duplicate_redirect: undefined;
    portfolio_asset_removed: undefined;
    portfolio_asset_reclassified: undefined;
    portfolio_targets_saved: undefined;
    portfolio_targets_reset: undefined;
    portfolio_tolerance_changed: undefined;
    portfolio_asset_targets_saved: { assetCount: number };
    portfolio_contribution_calculated: { classesFunded: number; currency: CurrencyCode };
    portfolio_onboarding_assets_step: { count: number };
    spending_credentials_saved: undefined;
    spending_credentials_removed: undefined;
    spending_items_added: { connected: number; failed: number };
    spending_sync_requested: { scope: 'one' | 'all' };
    spending_tutorial_step_checked: { step: number };
    spending_pluggy_link_clicked: { target: 'meu' | 'dashboard' | 'github' };
    spending_import_previewed: { format: SpendingImportFormatName };
    spending_import_completed: { format: SpendingImportFormatName; inserted: number; duplicates: number };
    spending_import_undone: undefined;
    spending_transaction_recategorized: { withRule: boolean; scope: 'counterparty' | 'description' | null };
    spending_rule_created: { matchType: SpendingRuleMatchName };
    spending_rule_deleted: undefined;
    spending_category_created: undefined;
    spending_flexibility_changed: { flexibility: SpendingFlexibilityName };
    spending_goal_saved: undefined;
    spending_income_mode_changed: { mode: 'transactions' | 'declared' };
    spending_cuts_viewed: { status: SpendingCutsStatusName };
    spending_contribution_shortcut: undefined;
    spending_export_downloaded: { format: ExportFormatName };
}

export type AnalyticsEventName = keyof AnalyticsEventMap;

export type AnalyticsProps<N extends AnalyticsEventName> = AnalyticsEventMap[N];

export type TrackArguments<N extends AnalyticsEventName> = AnalyticsEventMap[N] extends undefined ? [] : [props: AnalyticsEventMap[N]];

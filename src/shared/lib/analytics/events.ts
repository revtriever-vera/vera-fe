export type AuthProviderName = 'google' | 'facebook';
export type OnboardingStepName = 'welcome' | 'assets' | 'banks' | 'done';
export type AssetTypeName = 'fixed_income' | 'tesouro' | 'acoes_br' | 'fii' | 'acoes_eua' | 'reits' | 'cripto';
export type AddAssetSource = 'search' | 'fixed_income';
export type ExportFormatName = 'csv' | 'xlsx';
export type CurrencyCode = 'BRL' | 'USD';

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
}

export type AnalyticsEventName = keyof AnalyticsEventMap;

export type AnalyticsProps<N extends AnalyticsEventName> = AnalyticsEventMap[N];

export type TrackArguments<N extends AnalyticsEventName> = AnalyticsEventMap[N] extends undefined ? [] : [props: AnalyticsEventMap[N]];

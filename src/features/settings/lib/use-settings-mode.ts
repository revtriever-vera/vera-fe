import { useBilling } from '@/shared/lib/billing/use-billing';
import { SETTINGS_MODE, type SettingsMode } from '../types';

export interface SettingsModeState {
    readonly mode: SettingsMode;
    readonly ready: boolean;
}

export function useSettingsMode(): SettingsModeState {
    const { mode, isLoading } = useBilling();
    return { mode: mode === 'self_hosted' ? SETTINGS_MODE.selfHosted : SETTINGS_MODE.hosted, ready: !isLoading };
}

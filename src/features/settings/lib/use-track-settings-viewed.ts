import { useEffect } from 'react';
import { track } from '@/shared/lib/analytics';
import type { SettingsTabId } from '../types';

export function useTrackSettingsViewed(tab: SettingsTabId, enabled: boolean): void {
    useEffect((): void => {
        if (enabled) {
            track('settings_viewed', { tab });
        }
    }, [tab, enabled]);
}

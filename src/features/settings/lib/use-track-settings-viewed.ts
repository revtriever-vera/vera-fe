import { useEffect } from 'react';
import { track } from '@/shared/lib/analytics';
import type { SettingsTabId } from '../types';

export function useTrackSettingsViewed(tab: SettingsTabId): void {
    useEffect((): void => {
        track('settings_viewed', { tab });
    }, [tab]);
}

import { describe, expect, it } from 'vitest';
import { SETTINGS_MODE, type SettingsTab, type SettingsTabId } from '../types';
import { SETTINGS_TABS, currentSettingsMode, firstSettingsTab, resolveSettingsTab, visibleSettingsTabs } from './settings-tabs';

function ids(mode: 'hosted' | 'self_hosted'): readonly SettingsTabId[] {
    return visibleSettingsTabs({ mode }).map((tab: SettingsTab): SettingsTabId => tab.id);
}

describe('abas de configurações', () => {
    it('hospedada mostra Plano e uso e esconde Integrações', () => {
        expect(ids(SETTINGS_MODE.hosted)).toEqual(['plan', 'people', 'whatsapp', 'calendar', 'banks', 'preferences', 'privacy']);
    });

    it('auto-hospedada mostra Integrações no lugar de Plano e uso', () => {
        expect(ids(SETTINGS_MODE.selfHosted)).toEqual([
            'integrations',
            'people',
            'whatsapp',
            'calendar',
            'banks',
            'preferences',
            'privacy'
        ]);
    });

    it('a primeira aba depende do modo', () => {
        expect(firstSettingsTab({ mode: SETTINGS_MODE.hosted })).toBe('plan');
        expect(firstSettingsTab({ mode: SETTINGS_MODE.selfHosted })).toBe('integrations');
    });

    it('aba desconhecida ou escondida cai na primeira', () => {
        expect(resolveSettingsTab('banks', { mode: SETTINGS_MODE.hosted })).toBe('banks');
        expect(resolveSettingsTab('nada', { mode: SETTINGS_MODE.hosted })).toBe('plan');
        expect(resolveSettingsTab('integrations', { mode: SETTINGS_MODE.hosted })).toBe('plan');
        expect(resolveSettingsTab('plan', { mode: SETTINGS_MODE.selfHosted })).toBe('integrations');
    });

    it('tem ids únicos e assume hospedada enquanto o plano não existe', () => {
        expect(new Set(SETTINGS_TABS.map((tab: SettingsTab): string => tab.id)).size).toBe(SETTINGS_TABS.length);
        expect(currentSettingsMode()).toBe(SETTINGS_MODE.hosted);
    });
});

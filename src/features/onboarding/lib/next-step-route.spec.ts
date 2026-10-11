import { describe, expect, it } from 'vitest';
import { onboardingState } from '../../../../test/fixtures/onboarding';
import type { OnboardingState } from '../types';
import { resolveConnectionsLink } from './connections-link';
import { nextStepRoute } from './next-step-route';

const NOW: string = '2026-10-01T12:00:00.000Z';

function withBanks(banks: OnboardingState['steps']['banks']): OnboardingState {
    return onboardingState({ steps: { assets: { doneAt: NOW, skippedAt: null }, banks } });
}

describe('nextStepRoute', () => {
    it('de ativos vai a bancos quando bancos está em aberto', () => {
        expect(nextStepRoute(withBanks({ doneAt: null, skippedAt: null }), 'assets')).toBe('/onboarding/banks');
    });

    it('de ativos vai ao Pronto quando bancos já foi pulado ou feito', () => {
        expect(nextStepRoute(withBanks({ doneAt: null, skippedAt: NOW }), 'assets')).toBe('/onboarding/done');
        expect(nextStepRoute(withBanks({ doneAt: NOW, skippedAt: null }), 'assets')).toBe('/onboarding/done');
    });

    it('de bancos vai sempre ao Pronto', () => {
        expect(nextStepRoute(withBanks({ doneAt: null, skippedAt: null }), 'banks')).toBe('/onboarding/done');
    });
});

describe('resolveConnectionsLink', () => {
    it('trata a raiz como destino ausente e repassa os demais', () => {
        expect(resolveConnectionsLink('/')).toBeNull();
        expect(resolveConnectionsLink('/spending/connections')).toBe('/spending/connections');
    });
});

import { describe, expect, it } from 'vitest';
import { ONBOARDING_DESTINATIONS, type OnboardingDestinations } from '@/app/onboarding-destinations';
import type { AreaSummary } from '../types';
import { onboardingSummary } from '../../../../test/fixtures/onboarding';
import { isConfigured, landingDestination } from './landing-destination';

const DESTINATIONS: OnboardingDestinations = ONBOARDING_DESTINATIONS;
const WITH_ITEMS: AreaSummary = { items: 2, amountCents: null, currency: null };
const EMPTY: AreaSummary = { items: 0, amountCents: null, currency: null };

describe('landingDestination', () => {
    it('usa os destinos reais de gastos e de patrimônio', () => {
        expect(DESTINATIONS.spending).toBe('/spending');
        expect(DESTINATIONS.connections).toBe('/spending/connections');
    });

    it('vai à Visão geral quando há ativos', () => {
        expect(landingDestination(onboardingSummary({ assets: WITH_ITEMS, banks: WITH_ITEMS }), DESTINATIONS)).toBe('/portfolio');
    });

    it('vai ao resumo de gastos quando só há gastos', () => {
        expect(landingDestination(onboardingSummary({ assets: EMPTY, banks: WITH_ITEMS }), DESTINATIONS)).toBe('/spending');
        expect(landingDestination(onboardingSummary({ assets: null, banks: WITH_ITEMS }), DESTINATIONS)).toBe('/spending');
    });

    it('vai à Visão geral quando nada foi configurado ou o resumo não chegou', () => {
        expect(landingDestination(onboardingSummary({ assets: EMPTY, banks: EMPTY }), DESTINATIONS)).toBe('/portfolio');
        expect(landingDestination(undefined, DESTINATIONS)).toBe('/portfolio');
    });
});

describe('isConfigured', () => {
    it('é verdadeiro com ativos ou gastos e falso sem nada ou sem resumo', () => {
        expect(isConfigured(onboardingSummary({ assets: WITH_ITEMS }))).toBe(true);
        expect(isConfigured(onboardingSummary({ banks: WITH_ITEMS }))).toBe(true);
        expect(isConfigured(onboardingSummary({ assets: EMPTY }))).toBe(false);
        expect(isConfigured(undefined)).toBe(false);
    });
});

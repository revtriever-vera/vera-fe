import { describe, expect, it } from 'vitest';
import type { OnboardingState } from '../types';
import { onboardingState } from '../../../../test/fixtures/onboarding';
import { onboardingProgress, progressIndexOf, showsProgress, stepStatus } from './onboarding-progress';

const NOW: string = '2026-10-01T12:00:00.000Z';

describe('stepStatus', () => {
    it('distingue feita, pulada e pendente', () => {
        const state: OnboardingState = onboardingState({
            steps: { assets: { doneAt: NOW, skippedAt: null }, banks: { doneAt: null, skippedAt: NOW } }
        });

        expect(stepStatus(state, 'assets')).toBe('done');
        expect(stepStatus(state, 'banks')).toBe('skipped');
        expect(stepStatus(onboardingState(), 'banks')).toBe('pending');
    });
});

describe('progressIndexOf', () => {
    it.each([
        ['/onboarding', 0],
        ['/onboarding/', 0],
        ['/onboarding/assets', 1],
        ['/onboarding/banks/', 2],
        ['/onboarding/done', 3]
    ])('%s é o passo %i', (path: string, index: number) => {
        expect(progressIndexOf(path)).toBe(index);
    });
});

describe('onboardingProgress', () => {
    it('marca como puladas só as etapas de trabalho puladas', () => {
        const state: OnboardingState = onboardingState({
            steps: { assets: { doneAt: null, skippedAt: NOW }, banks: { doneAt: NOW, skippedAt: null } }
        });

        expect(onboardingProgress(state, '/onboarding/banks')).toEqual({ activeIndex: 2, skipped: [false, true, false, false] });
    });

    it('sem estado carregado nada fica pulado', () => {
        expect(onboardingProgress(undefined, '/onboarding/assets')).toEqual({ activeIndex: 1, skipped: [false, false, false, false] });
    });
});

describe('showsProgress', () => {
    it.each([
        ['/onboarding', false],
        ['/onboarding/assets', true],
        ['/onboarding/banks', true],
        ['/onboarding/done', false]
    ])('%s -> %s', (path: string, shown: boolean) => {
        expect(showsProgress(path)).toBe(shown);
    });
});

import { TUTORIAL_STEP_COUNT } from '../types';

const STORAGE_PREFIX: string = 'vera.spending.tutorial.';

function storageKey(companyId: string): string {
    return `${STORAGE_PREFIX}${companyId}`;
}

function isStep(value: unknown): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= TUTORIAL_STEP_COUNT;
}

export function readTutorialProgress(companyId: string): readonly number[] {
    try {
        const raw: string | null = window.localStorage.getItem(storageKey(companyId));
        const parsed: unknown = raw === null ? [] : JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter(isStep) : [];
    } catch {
        return [];
    }
}

export function writeTutorialProgress(companyId: string, steps: readonly number[]): void {
    try {
        window.localStorage.setItem(storageKey(companyId), JSON.stringify(steps));
    } catch {
        return;
    }
}

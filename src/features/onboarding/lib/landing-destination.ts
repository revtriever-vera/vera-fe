import type { OnboardingDestinations } from '@/app/onboarding-destinations';
import type { OnboardingSummary } from '../types';

function hasItems(area: OnboardingSummary['assets']): boolean {
    return area !== null && area.items > 0;
}

export function landingDestination(summary: OnboardingSummary | undefined, destinations: OnboardingDestinations): string {
    if (summary === undefined || hasItems(summary.assets)) {
        return destinations.overview;
    }
    return hasItems(summary.banks) ? destinations.spending : destinations.overview;
}

export function isConfigured(summary: OnboardingSummary | undefined): boolean {
    return summary !== undefined && (hasItems(summary.assets) || hasItems(summary.banks));
}

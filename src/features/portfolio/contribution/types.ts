import type { paths } from '@/shared/lib/api/schema';

export type ContributionSuggestion = paths['/portfolio/contributions/suggest']['post']['responses']['200']['content']['application/json'];
export type ContributionClass = ContributionSuggestion['classes'][number];
export type ContributionAsset = ContributionClass['assets'][number];
export type ContributionWarning = ContributionSuggestion['warnings'][number];

export const TARGETS_NOT_SET: string = 'contribution.targets_not_set';
export const TOO_MANY_REQUESTS: number = 429;

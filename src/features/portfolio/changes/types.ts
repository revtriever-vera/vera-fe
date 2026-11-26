import type { ApiPaths } from '@/shared/lib/api/api-paths';

export type ChangesResponse = ApiPaths['/portfolio-watch/changes']['get']['responses']['200']['content']['application/json'];
export type ChangeItem = ChangesResponse['items'][number];
export type ChangeKind = NonNullable<ChangeItem['kind']>;

export const CHANGES_WINDOWS = ['7', '30'] as const;

export type ChangesWindow = (typeof CHANGES_WINDOWS)[number];

export const PREVIEW_SIZE: number = 3;
export const LOCKED_ERROR_TYPE: string = 'plan.feature_locked';

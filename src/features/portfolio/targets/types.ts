import type { paths } from '@/shared/lib/api/schema';

export type ClassDetail = paths['/portfolio/classes/{classId}']['get']['responses']['200']['content']['application/json'];
export type ClassDetailAsset = ClassDetail['assets'][number];
export type AssetTargetsInput = paths['/allocation/targets/classes/{classId}/assets']['put']['requestBody']['content']['application/json'];
export type SavedAssetTargets =
    paths['/allocation/targets/classes/{classId}/assets']['put']['responses']['200']['content']['application/json'];
export type AssetTargetEntry = AssetTargetsInput['targets'][number];
export type AssetSubjectType = AssetTargetEntry['subjectType'];

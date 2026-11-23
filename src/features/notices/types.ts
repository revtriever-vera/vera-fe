import type { ApiPaths } from '@/shared/lib/api/api-paths';

export type NoticePreferences = ApiPaths['/notifications/preferences']['get']['responses']['200']['content']['application/json'];
export type NoticePreference = NoticePreferences['items'][number];
export type UpdateNoticeBody = NonNullable<ApiPaths['/notifications/preferences']['patch']['requestBody']>['content']['application/json'];
export type UnsubscribeResult = ApiPaths['/notifications/unsubscribe/{token}']['post']['responses']['200']['content']['application/json'];

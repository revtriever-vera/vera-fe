import type { paths } from '@/shared/lib/api/schema';

export type AuditList = paths['/platform/audit']['get']['responses']['200']['content']['application/json'];
export type AuditEntry = AuditList['items'][number];

type SignupLinksPath = paths['/platform/signup-links'];

export type SignupLinkList = SignupLinksPath['get']['responses']['200']['content']['application/json'];
export type SignupLink = SignupLinkList['items'][number];
export type SignupLinkStatus = SignupLink['status'];
export type TrialKind = SignupLink['trial']['kind'];
export type DiscountRule = SignupLink['rules'][number];
export type CreateSignupLinkInput = NonNullable<SignupLinksPath['post']['requestBody']>['content']['application/json'];

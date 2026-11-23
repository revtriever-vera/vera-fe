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
export type UpdateSignupLinkInput = NonNullable<
    paths['/platform/signup-links/{id}']['patch']['requestBody']
>['content']['application/json'];

export type PlatformOverview = paths['/platform/overview']['get']['responses']['200']['content']['application/json'];

type AccountsPath = paths['/platform/accounts']['get'];

export type AccountList = AccountsPath['responses']['200']['content']['application/json'];
export type AccountItem = AccountList['items'][number];
export type AccountPlan = AccountItem['plan'];

type AccessPath = paths['/platform/accounts/{id}/access']['post'];

export type AccessInput = NonNullable<AccessPath['requestBody']>['content']['application/json'];
export type AccessLayer = AccessInput['layers'][number];
export type AccountAccess = AccessPath['responses']['200']['content']['application/json'];
export type AccountSummary = NonNullable<AccountAccess['summary']>;
export type AccountPerson = AccountSummary['people'][number];

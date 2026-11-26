import type { paths } from '@/shared/lib/api/schema';

type Json<T> = T extends { responses: { 200: { content: { 'application/json': infer R } } } } ? R : never;

export type ConsentState = Json<paths['/ai/consent']['get']>;
export type SummaryView = Json<paths['/ai/summaries/{kind}']['get']>;
export type PayloadView = Json<paths['/ai/payload']['get']>;
export type SummaryKind = SummaryView['kind'];
export type PayloadKind = paths['/ai/payload']['get']['parameters']['query']['kind'];
export type ConsentSource = paths['/ai/consent']['put']['requestBody']['content']['application/json']['source'];

export const SUMMARY_KIND: { readonly month: 'month'; readonly cuts: 'cuts'; readonly portfolio: 'portfolio' } = {
    month: 'month',
    cuts: 'cuts',
    portfolio: 'portfolio'
};

export const SUMMARY_KINDS: readonly SummaryKind[] = [SUMMARY_KIND.month, SUMMARY_KIND.cuts, SUMMARY_KIND.portfolio];

export interface SummaryParams {
    readonly month?: string;
    readonly goalBps?: number;
    readonly contributionMinor?: number;
}

import type { PostHog } from 'posthog-js';
import { env } from '@/shared/config/env';
import type { AnalyticsEventName, TrackArguments } from './events';

interface PendingEvent {
    readonly name: AnalyticsEventName;
    readonly props: Record<string, unknown> | undefined;
}

const MAX_PENDING: number = 50;

let client: PostHog | null = null;
let starting: boolean = false;
let pending: PendingEvent[] = [];

function flush(target: PostHog): void {
    const queued: PendingEvent[] = pending;
    pending = [];
    queued.forEach((event: PendingEvent): void => {
        target.capture(event.name, event.props);
    });
}

export function isAnalyticsEnabled(): boolean {
    return env.VITE_POSTHOG_KEY !== '';
}

export function initAnalytics(): void {
    if (!isAnalyticsEnabled() || starting || client !== null) {
        return;
    }
    starting = true;
    void import('posthog-js')
        .then(({ default: posthog }): void => {
            posthog.init(env.VITE_POSTHOG_KEY, {
                api_host: env.VITE_POSTHOG_HOST,
                capture_pageview: true,
                capture_pageleave: true,
                autocapture: false,
                person_profiles: 'identified_only',
                disable_session_recording: true
            });
            client = posthog;
            flush(posthog);
        })
        .catch((): void => {
            starting = false;
            pending = [];
        });
}

export function track<N extends AnalyticsEventName>(name: N, ...args: TrackArguments<N>): void {
    if (!isAnalyticsEnabled()) {
        return;
    }
    const props: Record<string, unknown> | undefined = args[0];
    if (client !== null) {
        client.capture(name, props);
        return;
    }
    if (pending.length < MAX_PENDING) {
        pending.push({ name, props });
    }
}

export function resetAnalytics(): void {
    pending = [];
    client?.reset();
}

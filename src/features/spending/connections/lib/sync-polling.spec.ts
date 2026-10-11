import { describe, expect, it } from 'vitest';
import type { ConnectionView } from '../../types';
import { connectionView } from '../../../../../test/fixtures/spending';
import { anySyncing, POLL_WINDOW_MS, shouldPoll } from './sync-polling';

const SYNCING: ConnectionView[] = [connectionView({ syncing: true })];
const IDLE: ConnectionView[] = [connectionView({ syncing: false })];

describe('shouldPoll', () => {
    it('continua enquanto alguém sincroniza dentro da janela', () => {
        expect(shouldPoll(SYNCING, 1000, 1000 + POLL_WINDOW_MS - 1)).toBe(true);
    });

    it('para depois de 2 minutos', () => {
        expect(shouldPoll(SYNCING, 1000, 1000 + POLL_WINDOW_MS)).toBe(false);
    });

    it('para quando ninguém está sincronizando', () => {
        expect(shouldPoll(IDLE, 1000, 1001)).toBe(false);
        expect(shouldPoll([], 1000, 1001)).toBe(false);
    });
});

describe('anySyncing', () => {
    it('vê se ao menos uma conexão sincroniza', () => {
        expect(anySyncing([...IDLE, ...SYNCING])).toBe(true);
        expect(anySyncing(IDLE)).toBe(false);
    });
});

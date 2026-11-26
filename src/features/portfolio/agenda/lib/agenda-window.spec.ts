import { describe, expect, it } from 'vitest';
import { agendaWindow } from './agenda-window';

describe('agendaWindow', () => {
    it('vai de hoje até 30 dias depois', () => {
        expect(agendaWindow(new Date(2026, 10, 25, 9, 30))).toEqual({ from: '2026-11-25', to: '2026-12-25' });
    });

    it('vira o ano', () => {
        expect(agendaWindow(new Date(2026, 11, 20, 23, 59))).toEqual({ from: '2026-12-20', to: '2027-01-19' });
    });
});

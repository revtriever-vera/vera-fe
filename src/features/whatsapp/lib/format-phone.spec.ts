import { describe, expect, it } from 'vitest';
import { formatClock, formatPhone } from './format-phone';

describe('formatPhone', () => {
    it.each([
        ['+5511999990001', '+55 11 99999-0001'],
        ['551140000000', '+55 11 4000-0000'],
        ['+14155550100', '+14155550100']
    ])('%s vira %s', (raw, formatted) => {
        expect(formatPhone(raw)).toBe(formatted);
    });
});

describe('formatClock', () => {
    it('mostra só a hora no fuso do navegador', () => {
        expect(formatClock('2026-11-22T12:10:00.000Z', 'pt-BR')).toMatch(/^\d{2}:\d{2}$/);
    });
});

import { describe, expect, it } from 'vitest';
import { eventWhen } from './event-when';
import { isHttpsUrl } from './safe-redirect';

describe('eventWhen', () => {
    it('evento com hora mostra dia da semana, dia/mês e hora', () => {
        expect(eventWhen('2026-11-24T13:00:00.000Z', false, 'pt-BR')).toMatch(/^ter 24\/11 · \d{2}:\d{2}$/);
    });

    it('evento de dia todo não mostra hora e usa a data em UTC', () => {
        expect(eventWhen('2026-11-26T00:00:00.000Z', true, 'pt-BR')).toBe('qui 26/11');
    });

    it('em inglês usa o dia da semana em inglês', () => {
        expect(eventWhen('2026-11-26T00:00:00.000Z', true, 'en')).toMatch(/^Thu /);
    });
});

describe('isHttpsUrl', () => {
    it.each([
        ['https://accounts.google.com/o/oauth2/v2/auth', true],
        ['http://accounts.google.com', false],
        ['javascript:alert(1)', false],
        ['não é url', false]
    ])('%s', (url, expected) => {
        expect(isHttpsUrl(url)).toBe(expected);
    });
});

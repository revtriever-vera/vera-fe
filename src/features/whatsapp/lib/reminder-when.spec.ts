import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { i18n } from '@/shared/lib/i18n';
import type { ReminderItem } from '../types';
import { reminderItem } from '../../../../test/fixtures/whatsapp';
import { reminderWhen } from './reminder-when';

const t: TFunction<'whatsapp'> = i18n.getFixedT('pt-BR', 'whatsapp');

describe('reminderWhen', () => {
    it('mensal mostra o dia e a hora', () => {
        expect(reminderWhen(t, reminderItem(), 'pt-BR')).toBe('todo dia 5, 09:00');
    });

    it('único mostra a data', () => {
        const item: ReminderItem = reminderItem({ kind: 'once', dayOfMonth: null, nextAt: '2026-12-05T12:00:00.000Z' });
        expect(reminderWhen(t, item, 'pt-BR')).toMatch(/05\/12\/2026/);
    });

    it('sem próxima data avisa', () => {
        expect(reminderWhen(t, reminderItem({ kind: 'once', dayOfMonth: null, nextAt: null }), 'pt-BR')).toBe('sem data');
    });
});

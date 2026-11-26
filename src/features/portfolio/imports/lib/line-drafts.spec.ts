import { describe, expect, it } from 'vitest';
import type { LineEdit, PreviewLine } from '../types';
import { previewLine } from '../../../../../test/fixtures/investment-imports';
import {
    draftFieldInvalid,
    effectiveLine,
    lineActive,
    lineBlocked,
    lineInvalid,
    parseDecimal,
    patchDraft,
    toEdits,
    type Drafts
} from './line-drafts';

const NOT_FOUND: PreviewLine = previewLine({ lineId: 'a', status: 'blocked', reason: 'asset_not_found', assetId: null });
const BAD_QUANTITY: PreviewLine = previewLine({ lineId: 'b', status: 'blocked', reason: 'invalid_quantity', quantity: null });
const UNSUPPORTED: PreviewLine = previewLine({ lineId: 'c', status: 'blocked', reason: 'unsupported_direction' });

describe('parseDecimal', () => {
    it('aceita ponto e vírgula e recusa texto', () => {
        expect(parseDecimal('1,5')).toBe('1.5');
        expect(parseDecimal(' 12 ')).toBe('12');
        expect(parseDecimal('abc')).toBeNull();
        expect(parseDecimal('1,2,3')).toBeNull();
        expect(parseDecimal('-1')).toBeNull();
    });
});

describe('lineBlocked', () => {
    it('libera a linha sem ativo quando a pessoa escolhe um do catálogo', () => {
        expect(lineBlocked(NOT_FOUND, undefined)).toBe(true);
        expect(lineBlocked(NOT_FOUND, { asset: { id: 'x', ticker: 'VALE3', name: 'Vale' } })).toBe(false);
    });

    it('libera a linha sem quantidade só com uma quantidade válida', () => {
        expect(lineBlocked(BAD_QUANTITY, { quantity: '0' })).toBe(true);
        expect(lineBlocked(BAD_QUANTITY, { quantity: 'x' })).toBe(true);
        expect(lineBlocked(BAD_QUANTITY, { quantity: '10' })).toBe(false);
    });

    it('um motivo sem correção só sai deixando a linha de fora', () => {
        expect(lineBlocked(UNSUPPORTED, { quantity: '10' })).toBe(true);
        expect(lineBlocked(UNSUPPORTED, { skip: true })).toBe(false);
    });

    it('linha pronta nunca bloqueia', () => {
        expect(lineBlocked(previewLine(), undefined)).toBe(false);
    });
});

describe('rascunhos', () => {
    it('detecta número inválido e junta as correções', () => {
        const drafts: Drafts = patchDraft(patchDraft({}, 'a', { quantity: 'x' }), 'a', { unitPrice: '3,5' });
        expect(draftFieldInvalid(drafts['a'], 'quantity')).toBe(true);
        expect(draftFieldInvalid(drafts['a'], 'unitPrice')).toBe(false);
        expect(lineInvalid(drafts['a'])).toBe(true);
        expect(lineInvalid(undefined)).toBe(false);
    });

    it('a linha efetiva usa a correção e mantém o resto', () => {
        const line: PreviewLine = effectiveLine(previewLine(), { quantity: '2,5', tradeDate: '2026-01-02', feesMinor: 150 });
        expect(line).toMatchObject({ quantity: '2.5', unitPrice: '30', tradeDate: '2026-01-02', feesMinor: 150 });
    });

    it('linha ignorada, duplicada ou deixada de fora não conta', () => {
        expect(lineActive(previewLine(), undefined)).toBe(true);
        expect(lineActive(previewLine(), { skip: true })).toBe(false);
        expect(lineActive(previewLine({ status: 'duplicate' }), undefined)).toBe(false);
        expect(lineActive(previewLine({ status: 'ignored' }), undefined)).toBe(false);
    });
});

describe('toEdits', () => {
    it('manda só o que mudou, com a escolha de posição por ativo', () => {
        const lines: PreviewLine[] = [
            previewLine({ lineId: 'a' }),
            previewLine({ lineId: 'b', assetId: 'other' }),
            previewLine({ lineId: 'c', kind: 'income' })
        ];
        const drafts: Drafts = { a: { quantity: '200', feesMinor: 10 }, b: { skip: true } };

        expect(toEdits(lines, drafts, { 'asset-petr4': 'history_only' })).toEqual([
            { lineId: 'a', quantity: '200', feesMinor: 10, positionMode: 'history_only' },
            { lineId: 'b', skip: true }
        ]);
    });

    it('manda o ativo escolhido no catálogo', () => {
        const edits: LineEdit[] = toEdits([NOT_FOUND], { a: { asset: { id: 'asset-vale3', ticker: 'VALE3', name: 'Vale' } } }, {});
        expect(edits).toEqual([{ lineId: 'a', assetId: 'asset-vale3' }]);
    });
});

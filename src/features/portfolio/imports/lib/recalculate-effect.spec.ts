import { describe, expect, it } from 'vitest';
import type { EffectItem, PositionBalance, PreviewLine } from '../types';
import { effectItem, previewLine, PETR4_ID } from '../../../../../test/fixtures/investment-imports';
import type { Drafts } from './line-drafts';
import { buildEffectRows, type EffectRow } from './recalculate-effect';

const BEFORE: PositionBalance = { quantity: '100', averagePrice: '32.1' };

function rowOf(rows: readonly EffectRow[]): EffectRow {
    const row: EffectRow | undefined = rows[0];
    if (row === undefined) {
        throw new Error('sem linha');
    }
    return row;
}

describe('buildEffectRows', () => {
    it('sem correção, mantém o efeito da API', () => {
        const effect: EffectItem[] = [
            effectItem({ before: BEFORE, after: { quantity: '200', averagePrice: '31' }, existingPosition: true })
        ];
        const rows: EffectRow[] = buildEffectRows(effect, [previewLine()], {}, {});

        expect(rowOf(rows)).toMatchObject({ after: { quantity: '200', averagePrice: '31' }, recalculated: false });
    });

    it('só pede o modo da posição quando há linha que muda a posição', () => {
        const effect: EffectItem[] = [effectItem({ before: BEFORE, existingPosition: true })];

        expect(rowOf(buildEffectRows(effect, [previewLine({ kind: 'income' })], {}, {})).needsMode).toBe(false);
        expect(rowOf(buildEffectRows(effect, [previewLine({ kind: 'buy' })], {}, {})).needsMode).toBe(true);
    });

    it('recalcula a compra corrigida pelo preço médio ponderado', () => {
        const effect: EffectItem[] = [effectItem({ before: BEFORE, existingPosition: true })];
        const rows: EffectRow[] = buildEffectRows(effect, [previewLine({ lineId: 'a' })], { a: { quantity: '200' } }, {});

        expect(rowOf(rows)).toMatchObject({ after: { quantity: '300', averagePrice: '30.7' }, recalculated: true });
    });

    it('soma as taxas ao custo da compra', () => {
        const effect: EffectItem[] = [effectItem({ before: null })];
        const rows: EffectRow[] = buildEffectRows(
            effect,
            [previewLine({ lineId: 'a', quantity: '10', unitPrice: '10' })],
            { a: { feesMinor: 1000 } },
            {}
        );

        expect(rowOf(rows).after).toEqual({ quantity: '10', averagePrice: '11' });
    });

    it('"já está na posição" deixa a posição como estava', () => {
        const effect: EffectItem[] = [effectItem({ before: BEFORE, existingPosition: true })];
        const rows: EffectRow[] = buildEffectRows(effect, [previewLine()], {}, { [PETR4_ID]: 'history_only' });

        expect(rowOf(rows)).toMatchObject({ after: { quantity: '100', averagePrice: '32.1' }, recalculated: true });
    });

    it('venda reduz a quantidade e mantém o preço médio; vender tudo encerra', () => {
        const effect: EffectItem[] = [effectItem({ before: BEFORE, existingPosition: true })];
        const sell: PreviewLine = previewLine({ lineId: 's', kind: 'sell', quantity: '40' });

        expect(rowOf(buildEffectRows(effect, [sell], { s: { quantity: '40' } }, {})).after).toEqual({
            quantity: '60',
            averagePrice: '32.1'
        });
        expect(rowOf(buildEffectRows(effect, [sell], { s: { quantity: '100' } }, {})).after).toBeNull();
    });

    it('desdobramento, grupamento e bonificação', () => {
        const effect: EffectItem[] = [effectItem({ before: { quantity: '100', averagePrice: '10' }, existingPosition: true })];
        const run = (kind: 'split' | 'reverse_split' | 'bonus', quantity: string): EffectRow =>
            rowOf(buildEffectRows(effect, [previewLine({ lineId: 'e', kind, quantity })], { e: { quantity } }, {}));

        expect(run('split', '2').after).toEqual({ quantity: '200', averagePrice: '5' });
        expect(run('reverse_split', '4').after).toEqual({ quantity: '25', averagePrice: '40' });
        expect(run('bonus', '100').after).toEqual({ quantity: '200', averagePrice: '5' });
    });

    it('ignora linha deixada de fora e linha de provento', () => {
        const effect: EffectItem[] = [effectItem({ before: BEFORE, existingPosition: true })];
        const lines: PreviewLine[] = [previewLine({ lineId: 'a' }), previewLine({ lineId: 'i', kind: 'income' })];
        const rows: EffectRow[] = buildEffectRows(effect, lines, { a: { skip: true } }, {});

        expect(rowOf(rows).after).toEqual(BEFORE);
    });

    it('cria a linha do ativo escolhido no catálogo', () => {
        const blocked: PreviewLine = previewLine({
            lineId: 'a',
            status: 'blocked',
            reason: 'asset_not_found',
            assetId: null,
            ticker: 'VALE'
        });
        const drafts: Drafts = { a: { asset: { id: 'asset-vale3', ticker: 'VALE3', name: 'Vale ON' } } };
        const rows: EffectRow[] = buildEffectRows([], [blocked], drafts, {});

        expect(rowOf(rows)).toMatchObject({
            assetId: 'asset-vale3',
            ticker: 'VALE3',
            before: null,
            after: { quantity: '100', averagePrice: '30' }
        });
    });
});

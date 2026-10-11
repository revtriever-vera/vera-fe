import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type Rgb = readonly [number, number, number];

const CSS: string = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');
const AA_TEXT: number = 4.5;

function token(name: string): string {
    const match: RegExpMatchArray | null = CSS.match(new RegExp(`--color-${name}:\\s*([^;]+);`));
    if (match?.[1] === undefined) {
        throw new Error(`token --color-${name} ausente`);
    }
    return match[1].trim();
}

function hexToRgb(hex: string): Rgb {
    const value: string = hex.replace('#', '');
    return [0, 2, 4].map((start: number): number => parseInt(value.slice(start, start + 2), 16)) as unknown as Rgb;
}

function toLinear(channel: number): number {
    const unit: number = channel / 255;
    return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
}

function luminance([red, green, blue]: Rgb): number {
    return 0.2126 * toLinear(red) + 0.7152 * toLinear(green) + 0.0722 * toLinear(blue);
}

function ratio(foreground: Rgb, background: Rgb): number {
    const [lighter, darker]: number[] = [luminance(foreground), luminance(background)].sort((a: number, b: number): number => b - a);
    return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05);
}

function toOklab([red, green, blue]: Rgb): Rgb {
    const [r, g, b]: number[] = [toLinear(red), toLinear(green), toLinear(blue)];
    const l: number = Math.cbrt(0.4122214708 * (r ?? 0) + 0.5363325363 * (g ?? 0) + 0.0514459929 * (b ?? 0));
    const m: number = Math.cbrt(0.2119034982 * (r ?? 0) + 0.6806995451 * (g ?? 0) + 0.1073969566 * (b ?? 0));
    const s: number = Math.cbrt(0.0883024619 * (r ?? 0) + 0.2817188376 * (g ?? 0) + 0.6299787005 * (b ?? 0));
    return [
        0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
        1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
        0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
    ];
}

function fromOklab([lightness, a, b]: Rgb): Rgb {
    const l: number = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m: number = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s: number = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
    const linear: number[] = [
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
    ];
    const encode = (value: number): number => {
        const clamped: number = Math.min(1, Math.max(0, value));
        return 255 * (clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055);
    };
    return linear.map(encode) as unknown as Rgb;
}

function mixOver(tint: Rgb, share: number, base: Rgb): Rgb {
    const top: Rgb = toOklab(tint);
    const bottom: Rgb = toOklab(base);
    return fromOklab(
        [0, 1, 2].map((index: number): number => (top[index] ?? 0) * share + (bottom[index] ?? 0) * (1 - share)) as unknown as Rgb
    );
}

function soft(name: string): Rgb {
    const match: RegExpMatchArray | null = token(`${name}-soft`).match(/color-mix\(in oklab,\s*(#[0-9a-fA-F]{6})\s+(\d+)%/);
    if (match?.[1] === undefined || match[2] === undefined) {
        throw new Error(`token --color-${name}-soft fora do formato esperado`);
    }
    return mixOver(hexToRgb(match[1]), Number(match[2]) / 100, hexToRgb(token('surface')));
}

const SURFACE: Rgb = hexToRgb(token('surface'));
const CANVAS: Rgb = hexToRgb(token('canvas'));

describe('contraste dos tokens de texto', () => {
    it.each(['positive', 'caution', 'critical', 'info', 'accent-strong', 'content-muted', 'content'])(
        '%s tem AA em texto pequeno sobre surface e canvas',
        (name: string) => {
            const foreground: Rgb = hexToRgb(token(name));

            expect(ratio(foreground, SURFACE)).toBeGreaterThanOrEqual(AA_TEXT);
            expect(ratio(foreground, CANVAS)).toBeGreaterThanOrEqual(AA_TEXT);
        }
    );

    it.each(['positive', 'caution'])('%s tem AA sobre o próprio fundo suave e sobre o tom de 10%% do badge', (name: string) => {
        const foreground: Rgb = hexToRgb(token(name));

        expect(ratio(foreground, soft(name))).toBeGreaterThanOrEqual(AA_TEXT);
        expect(ratio(foreground, mixOver(foreground, 0.1, SURFACE))).toBeGreaterThanOrEqual(AA_TEXT);
        expect(ratio(foreground, mixOver(foreground, 0.1, CANVAS))).toBeGreaterThanOrEqual(AA_TEXT);
    });

    it('mantém os fundos suaves de positive e caution nos tons originais', () => {
        expect(token('positive-soft')).toContain('#1b8f63');
        expect(token('caution-soft')).toContain('#c2620d');
    });
});

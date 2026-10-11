import { describe, expect, it } from 'vitest';
import { exportFilename, FALLBACK_EXPORT_FILENAME } from './export-filename';

describe('exportFilename', () => {
    it.each([
        ['attachment; filename="vera-export-2026-10-11.json"', 'vera-export-2026-10-11.json'],
        ['attachment; filename=vera-export.json; size=1', 'vera-export.json'],
        [null, FALLBACK_EXPORT_FILENAME],
        ['attachment', FALLBACK_EXPORT_FILENAME],
        ['attachment; filename="../etc/passwd"', FALLBACK_EXPORT_FILENAME],
        ['attachment; filename=".hidden"', FALLBACK_EXPORT_FILENAME],
        ['attachment; filename="a b.json"', FALLBACK_EXPORT_FILENAME]
    ])('reads %s', (header: string | null, expected: string): void => {
        expect(exportFilename(header)).toBe(expected);
    });
});

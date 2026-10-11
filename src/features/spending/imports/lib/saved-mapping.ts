import { csvMappingSchema, type CsvMapping } from '../schemas/mapping.schema';

const STORAGE_PREFIX: string = 'vera.spending.import-mapping.';

function keyOf(fileName: string): string {
    const dot: number = fileName.lastIndexOf('.');
    const base: string = dot > 0 ? fileName.slice(0, dot) : fileName;
    return `${STORAGE_PREFIX}${base.trim().toLowerCase()}`;
}

export function loadSavedMapping(fileName: string): CsvMapping | null {
    try {
        const raw: string | null = window.localStorage.getItem(keyOf(fileName));
        if (raw === null) {
            return null;
        }
        const parsed: ReturnType<typeof csvMappingSchema.safeParse> = csvMappingSchema.safeParse(JSON.parse(raw));
        return parsed.success ? parsed.data : null;
    } catch {
        return null;
    }
}

export function saveMapping(fileName: string, mapping: CsvMapping): void {
    try {
        window.localStorage.setItem(keyOf(fileName), JSON.stringify(mapping));
    } catch {
        return;
    }
}

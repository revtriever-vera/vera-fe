import { Blob as NodeBlob, File as NodeFile } from 'node:buffer';
import { vi } from 'vitest';

async function nodeFormDataClass(): Promise<typeof FormData> {
    const probe: FormData = await new Response(new URLSearchParams()).formData();
    return probe.constructor as typeof FormData;
}

export async function stubNodeMultipart(): Promise<void> {
    vi.stubGlobal('FormData', await nodeFormDataClass());
    vi.stubGlobal('File', NodeFile);
    vi.stubGlobal('Blob', NodeBlob);
}

export function statementFile(content: string, name: string, type: string = 'text/plain'): File {
    return new NodeFile([content], name, { type }) as unknown as File;
}

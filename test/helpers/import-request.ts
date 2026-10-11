export interface ImportRequestForm {
    readonly fileText: string | null;
    readonly fields: Readonly<Record<string, string>>;
}

export async function readImportForm(request: Request): Promise<ImportRequestForm> {
    const form: FormData = await request.formData();
    const fields: Record<string, string> = {};
    let fileText: string | null = null;
    for (const [key, value] of form.entries()) {
        if (typeof value === 'string') {
            fields[key] = value;
        } else {
            fileText = await value.text();
        }
    }
    return { fileText, fields };
}

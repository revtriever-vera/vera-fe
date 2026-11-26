export interface TurnFormInput {
    readonly file: File;
    readonly text: string;
    readonly path: string;
    readonly conversationId: string | null;
    readonly modelConsent: boolean;
}

export function buildTurnFormData({ file, text, path, conversationId, modelConsent }: TurnFormInput): FormData {
    const form: FormData = new FormData();
    form.append('file', file, file.name);
    if (text !== '') {
        form.append('text', text);
    }
    form.append('screenPath', path);
    if (conversationId !== null) {
        form.append('conversationId', conversationId);
    }
    if (modelConsent) {
        form.append('modelConsent', 'true');
    }
    return form;
}

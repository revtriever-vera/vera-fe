export interface PreviewFormInput {
    readonly file: File;
    readonly holderUserId?: string;
    readonly modelConsent?: boolean;
}

export function buildPreviewFormData({ file, holderUserId, modelConsent }: PreviewFormInput): FormData {
    const form: FormData = new FormData();
    form.append('file', file, file.name);
    if (holderUserId !== undefined) {
        form.append('holderUserId', holderUserId);
    }
    if (modelConsent === true) {
        form.append('modelConsent', 'true');
    }
    return form;
}

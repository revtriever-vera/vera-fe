import type { AccountKind, ImportFormat } from '../../types';
import type { CsvMapping } from '../schemas/mapping.schema';

export interface ExistingAccountTarget {
    readonly accountId: string;
}

export interface NewAccountTarget {
    readonly newAccountName: string;
    readonly newAccountKind: AccountKind;
    readonly newAccountInstitution?: string;
}

export type ImportTarget = ExistingAccountTarget | NewAccountTarget;

export interface ImportFormInput {
    readonly file: File;
    readonly format?: ImportFormat;
    readonly mapping?: CsvMapping;
    readonly target?: ImportTarget;
}

function appendTarget(form: FormData, target: ImportTarget): void {
    if ('accountId' in target) {
        form.append('accountId', target.accountId);
        return;
    }
    form.append('newAccountName', target.newAccountName);
    form.append('newAccountKind', target.newAccountKind);
    if (target.newAccountInstitution !== undefined && target.newAccountInstitution !== '') {
        form.append('newAccountInstitution', target.newAccountInstitution);
    }
}

export function buildImportFormData({ file, format, mapping, target }: ImportFormInput): FormData {
    const form: FormData = new FormData();
    form.append('file', file, file.name);
    if (format !== undefined) {
        form.append('format', format);
    }
    if (mapping !== undefined) {
        form.append('mapping', JSON.stringify(mapping));
    }
    if (target !== undefined) {
        appendTarget(form, target);
    }
    return form;
}

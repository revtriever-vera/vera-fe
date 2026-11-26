export const INVESTMENT_IMPORT_MAX_FILE_BYTES: number = 10 * 1024 * 1024;

export const INVESTMENT_IMPORT_ACCEPT: Readonly<Record<string, readonly string[]>> = {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'text/csv': ['.csv'],
    'application/pdf': ['.pdf'],
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/heic': ['.heic'],
    'image/heif': ['.heif'],
    'image/webp': ['.webp']
};

export const MODEL_CONSENT_REQUIRED: string = 'model.confirmation_required';

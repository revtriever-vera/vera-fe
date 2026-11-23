import type { ReactElement } from 'react';

export function ErrorLine({ message }: { readonly message: string | undefined }): ReactElement | null {
    return message === undefined ? null : (
        <p role="alert" className="text-2xs text-critical">
            {message}
        </p>
    );
}

const REVOKE_DELAY_MS: number = 0;

export function downloadBlob(blob: Blob, filename: string): void {
    const url: string = URL.createObjectURL(blob);
    const link: HTMLAnchorElement = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    link.style.display = 'none';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout((): void => {
        URL.revokeObjectURL(url);
    }, REVOKE_DELAY_MS);
}

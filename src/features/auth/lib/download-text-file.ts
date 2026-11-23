export function downloadTextFile(fileName: string, content: string): void {
    const url: string = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    const link: HTMLAnchorElement = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
}

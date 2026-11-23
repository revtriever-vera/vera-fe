export const whatsappKeys: {
    all: readonly ['whatsapp'];
    link: () => readonly ['whatsapp', 'link'];
    reminders: () => readonly ['whatsapp', 'reminders'];
} = {
    all: ['whatsapp'] as const,
    link: (): readonly ['whatsapp', 'link'] => [...whatsappKeys.all, 'link'] as const,
    reminders: (): readonly ['whatsapp', 'reminders'] => [...whatsappKeys.all, 'reminders'] as const
};

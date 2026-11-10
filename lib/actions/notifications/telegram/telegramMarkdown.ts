export const escapeTelegramMarkdownV2 = (text: string) => text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, "\\$1");

export const escapeTelegramLinkUrl = (url: string) => url.replace(/([\\)])/g, "\\$1");

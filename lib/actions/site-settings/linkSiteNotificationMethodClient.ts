'use server';

import linkSiteNotificationMethod, { type LinkNotificationMethodArgs } from "./linkSiteNotificationMethod";

export default async function linkSiteNotificationMethodClient(...[method, value]: LinkNotificationMethodArgs) {
    return await linkSiteNotificationMethod(...[method, value] as LinkNotificationMethodArgs);
}

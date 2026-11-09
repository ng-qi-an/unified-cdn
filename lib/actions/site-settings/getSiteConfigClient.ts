'use server';

import getSiteConfig from "./getSiteConfig";

export default async function getSiteConfigClient(){
    return await getSiteConfig();
}
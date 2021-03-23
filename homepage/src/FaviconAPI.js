import {storageDelete, storageGet, storageKeys, storageSet} from "./Storage";

const CACHE_LIFESPAN = 1000 * 60 * 60 * 24 * 7; // 1 week in milliseconds

export async function getFaviconData(host) {
    let newExpiryDate = Date.now() + CACHE_LIFESPAN;
    let cached = storageGet(host);
    if (cached) {
        let data = cached.data ?? cached; // backwards compatibility with old format w/o pod format
        storageSet(host, {expiry: newExpiryDate, data: data});
        return data;
    }
    let response = await fetch(`https://us-central1-chrome-better-home.cloudfunctions.net/getIcon?domain=${host}`);
    return await response.text();
}

export async function getFaviconImg(host) {
    let data = await getFaviconData(host);
    return <img src={data} alt=""/>
}

export function clearExpiredFavicons() {
    let now = Date.now();
    let keys = storageKeys();
    for (let key of keys) {
        let item = storageGet(key);
        if (item.expiry && item.expiry <= now) {
            storageDelete(key);
        }
    }
}

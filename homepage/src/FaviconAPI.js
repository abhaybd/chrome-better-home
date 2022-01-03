import {storageDelete, storageGet, storageKeys, storageSet} from "./Storage";

const CACHE_LIFESPAN = 1000 * 60 * 60 * 24 * 7; // 1 week in milliseconds
const FAVICON_PREFIX = "FAVICON_";
const API_PREFIX = "https://www.google.com/s2/favicons?domain=";

export async function getFaviconData(host) {
    let newExpiryDate = Date.now() + CACHE_LIFESPAN;
    let cacheName = FAVICON_PREFIX + host;
    let cached = storageGet(cacheName);
    // only use cached item if not expired
    if (cached && cached.expiry > Date.now()) {
        return cached.data;
    }
    let response = await fetch(API_PREFIX + host);
    let bufRaw = await response.text();
    if (response.ok) {
        // cache the data
        let b64 = Buffer.from(bufRaw).toString("base64");
        let data = "data:" + response.headers["content-type"] + ";base64," + b64;
        storageSet(cacheName, {expiry: newExpiryDate, data: data});
        return data;
    } else {
        console.error(`An error occurred while fetching favicon data for host=${host}! Status=${response.status}, Message=${bufRaw}`);
    }
}

export async function getFaviconImg(host) {
    let data = await getFaviconData(host);
    return <img src={data} alt=""/>
}

export function clearAllFavicons() {
    storageKeys()
        .filter(k => k.startsWith(FAVICON_PREFIX))
        .forEach(storageDelete)
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

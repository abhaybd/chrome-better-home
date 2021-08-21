import {storageDelete, storageGet, storageKeys, storageSet} from "./Storage";

const CACHE_LIFESPAN = 1000 * 60 * 60 * 24 * 7; // 1 week in milliseconds
const FAVICON_PREFIX = "FAVICON_";
const API_PREFIX = "https://us-central1-chrome-better-home.cloudfunctions.net/getIcon?domain=";

export async function getFaviconData(host) {
    let newExpiryDate = Date.now() + CACHE_LIFESPAN;
    let cached = storageGet(host);
    if (cached) {
        return cached.data;
    }
    let response = await fetch(API_PREFIX + host);
    let data = await response.text();
    if (response.ok) {
        // cache the data
        storageSet(FAVICON_PREFIX + host, {expiry: newExpiryDate, data: data});
        return data;
    } else {
        console.error(`An error occurred while fetching favicon data! Status=${response.status}, Message=${data}`)
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

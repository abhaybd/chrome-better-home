import {storageDelete, storageGet, storageKeys, storageSet} from "./Storage";

const CACHE_LIFESPAN = 1000 * 60 * 60 * 24 * 7 * 2; // 2 weeks in milliseconds
const FAVICON_PREFIX = "FAVICON_";
const API_PREFIX = "https://us-central1-chrome-better-home.cloudfunctions.net/getIcon?domain="
const FALLBACK_FAVICON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsSAAALE" +
    "gHS3X78AAACiElEQVQ4EaVTzU8TURCf2tJuS7tQtlRb6UKBIkQwkRRSEzkQgyEc6lkOKgcOph78Y+CgjXjDs2i44FXY9AMTlQRUELZapVlou" +
    "y3d7kKtb0Zr0MSLTvL2zb75eL838xtTvV6H/xELBptMJojeXLCXyobnyog4YhzXYvmCFi6qVSfaeRdXdrfaU1areV5KykmX06rcvzumjY/1g" +
    "gkR3Jh+bNf1mr8v1D5bLuvR3qDgFbvbBJYIrE1mCIoCrKxsHuzK+Rzvsi29+6DEbTZz9unijEYI8ObBgXOzlcrx9OAlXyDYKUCzwwrDQx1wV" +
    "DGg089Dt+gR3mxmhcUnaWeoxwMbm/vzDFzmDEKMMNhquRqduT1KwXiGt0vre6iSeAUHNDE0d26NBtAXY9BACQyjFusKuL2Ry+IPb/Y9Zglwu" +
    "VscdHaknUChqLF/O4jn3V5dP4mhgRJgwSYm+gV0Oi3XrvYB30yvhGa7BS70eGFHPoTJyQHhMK+F0ZesRVVznvXw5Ixv7/C10moEo6OZXbWvl" +
    "FAF9FVZDOqEABUMRIkMd8GnLwVWg9/RkJF9sA4oDfYQAuzzjqzwvnaRUFxn/X2ZlmGLXAE7AL52B4xHgqAUqrC1nSNuoJkQtLkdqReszz/9a" +
    "Rvq90NOKdOS1nch8TpL555WDp49f3uAMXhACRjD5j4ykuCtf5PP7Fm1b0DIsl/VHGezzP1KwOiZQobFF9YyjSRYQETRENSlVzI8iK9mWlzck" +
    "pSSCQHVALmN9Az1euDho9Xo8vKGd2rqooA8yBcrwHgCqYR0kMkWci08t/R+W4ljDCanWTg9TJGwGNaNk3vYZ7VUdeKsYJGFNkfSzjXNrSX20" +
    "s4/h6kB81/271ghG17l+rPTAAAAAElFTkSuQmCC";

export const DEFAULT_FAVICON = <img src={FALLBACK_FAVICON} alt="" />;

export async function getFaviconData(host) {
    let newExpiryDate = Date.now() + CACHE_LIFESPAN;
    let cacheName = FAVICON_PREFIX + host;
    let cached = storageGet(cacheName);
    // only use cached item if not expired
    if (cached && cached.expiry > Date.now()) {
        return cached.data;
    }
    try {
        let response = await fetch(API_PREFIX + host);
        let data = await response.text();
        if (response.status === 200) {
            // cache the data
            storageSet(cacheName, {expiry: newExpiryDate, data: data});
            return data;
        } else if (response.status === 204) {
            // no favicon found, use fallback favicon (no caching)
            console.warn(`Favicon not found for host: ${host}`);
            return cached?.data ?? FALLBACK_FAVICON;
        } else {
            console.error(`API returned an error for host=${host}! Status=${response.status}, Message=${data}`);
            return cached?.data ?? FALLBACK_FAVICON;
        }
    } catch {
        console.error(`An error occurred while fetching favicon for host=${host}!`);
        return cached?.data ?? FALLBACK_FAVICON;
    }
}

export function removeFaviconData(host) {
    storageDelete(FAVICON_PREFIX + host);
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

const ENABLE = false && false;

export async function storageGet(key, defaultVal) {
    if (ENABLE) {
        // eslint-disable-next-line no-undef
        return await get(key);
    } else {
        return new Promise(resolve => resolve(defaultVal));
    }
}

export async function storageSet(key, val) {
    if (ENABLE) {
        // eslint-disable-next-line no-undef
        return await set(key, val);
    } else {
        return new Promise(resolve => resolve());
    }
}

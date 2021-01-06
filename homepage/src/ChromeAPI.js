let ENABLE;

try {
    // eslint-disable-next-line no-undef
    ENABLE = chrome.storage.get !== undefined;
    console.log("Enabled persistence!");
} catch {
    ENABLE = false;
    console.log("Disabled persistence!");
}

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

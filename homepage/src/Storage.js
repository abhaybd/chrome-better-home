export function storageGet(key, defaultVal) {
    let ret = null;
    try {
        ret = localStorage.getItem(key);
        return ret ? JSON.parse(ret) : defaultVal;
    } catch (e) {
        console.log(`Error while getting value for key: ${key}. Value: ${ret}`);
        console.error(e);
        return defaultVal;
    }
}

export function storageSet(key, val) {
    if (val !== null && val !== undefined) {
        let jsonStr = JSON.stringify(val);
        localStorage.setItem(key, jsonStr);
    }
}

export function storageClear() {
    localStorage.clear();
    sessionStorage.clear();
}

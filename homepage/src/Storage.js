export function storageGet(key, defaultVal, persistent = true) {
    let ret = null;
    try {
        if (persistent === true) {
            ret = localStorage.getItem(key);
        } else {
            ret = sessionStorage.getItem(key);
        }
        return ret ? JSON.parse(ret) : defaultVal;
    } catch (e) {
        console.log(`Error while getting value for key: ${key}. Value: ${ret}`);
        console.error(e);
        return defaultVal;
    }
}

export function storageSet(key, val, persistent = true) {
    if (val) {
        val = JSON.stringify(val);
        if (persistent === true) {
            localStorage.setItem(key, val);
        } else {
            sessionStorage.setItem(key, val);
        }
    }
}

export function storageClear() {
    localStorage.clear();
    sessionStorage.clear();
}

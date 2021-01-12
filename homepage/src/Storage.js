export function storageGet(key, defaultVal, persistent = true) {
    try {
        let ret;
        if (persistent === true) {
            ret = localStorage.getItem(key);
        } else {
            ret = sessionStorage.getItem(key);
        }
        return ret ? JSON.parse(ret) : defaultVal;
    } catch (e) {
        console.log("Encountered error while getting value for key: " + key);
        console.error(e);
        return defaultVal;
    }
}

export function storageSet(key, val, persistent = true) {
    val = JSON.stringify(val);
    if (persistent === true) {
        localStorage.setItem(key, val);
    } else {
        sessionStorage.setItem(key, val);
    }
}

export function storageClear() {
    localStorage.clear();
    sessionStorage.clear();
}

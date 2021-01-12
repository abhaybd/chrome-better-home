export function storageGet(key, defaultVal, persistent=true) {
    let ret;
    if (persistent === true) {
        ret = localStorage.getItem(key);
    } else {
        ret = sessionStorage.getItem(key);
    }
    return ret ? JSON.parse(ret) : defaultVal;
}

export function storageSet(key, val, persistent=true) {
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

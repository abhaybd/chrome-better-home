export function storageGet(key, defaultVal, persistent=false) {
    let ret;
    if (persistent === true) {
        ret = localStorage.getItem(key);
    } else {
        ret = sessionStorage.getItem(key);
    }
    return JSON.parse(ret) ?? defaultVal;
}

export function storageSet(key, val, persistent=false) {
    val = JSON.stringify(val);
    if (persistent === true) {
        localStorage.setItem(key, val);
    } else {
        sessionStorage.setItem(key, val);
    }
}

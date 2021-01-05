async function get(key) {
    return new Promise(resolve => {
        // eslint-disable-next-line no-undef
        chrome.storage.local.get(key, function(obj) {
            resolve(obj.key);
        });
    });
}

async function set(key, val) {
    return new Promise(resolve => {
        // eslint-disable-next-line no-undef
        chrome.storage.local.set({key: val});
    });
}

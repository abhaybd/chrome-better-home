import {storageGet, storageSet} from "./Storage";

export async function getFaviconData(host) {
    let cached = storageGet(host);
    if (cached) {
        return cached;
    }
    let response = await fetch("https://cors-anywhere.herokuapp.com/https://s2.googleusercontent.com/s2/favicons?domain=" + host);
    let blob = await response.blob();
    return new Promise(resolve => {
        let reader = new FileReader();
        reader.onloadend = function () {
            let data = reader.result;
            console.log(data);
            storageSet(host, data);
            resolve(data);
        }
        reader.readAsDataURL(blob);
    });
}

export async function getFaviconImg(host) {
    let data = await getFaviconData(host);
    return <img src={data} alt=""/>
}

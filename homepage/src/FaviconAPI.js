export async function getFaviconData(host) {
    let response = await fetch("https://cors-anywhere.herokuapp.com/https://s2.googleusercontent.com/s2/favicons?domain=" + host);
    let blob = await response.blob();
    return new Promise(resolve => {
        let reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function() {
            let data = reader.result;
            console.log(data);
            resolve(data);
        }
    });
}

export async function getFaviconImg(host) {
    let data = await getFaviconData(host);
    return <img src={data} />
}

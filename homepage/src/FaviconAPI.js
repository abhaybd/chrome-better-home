import {storageGet, storageSet} from "./Storage";

storageSet("mail.google.com", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAglJREFUOI2Nk99L02EUxj/vNkthRdToFxLNJqaJESYVXtSN3ZS1CqMM6qKLQKJ/oPsF3eV1F1HRBrVcGV4FdRPeJUK0oeYaUmyzRbOxpvtuTxd+v7atIA+ci/e8z3nOe57zHmgwSQFJEUkzksq2z9ixtkZ8bSKSxvR/i0r6Z3LCQRRfxZS7claZ7u3KHPApd3lQxfE67rhDYmyCMSCo5RLfh89QSc6A2w1WebWCZwNaLtLU08fWxy+cus+NMRecniVJi+dOKtPfrUzPLhUij2TNz8lKzqkQfqjs0XZV8j8a2/FjiyPrQ1iZI61Kd+yUtZBahxSSpDC2wrImA1qZQMXo6HqTJSnhAfwAys9h3NA80FsnsLn1kw6vWTv/qkCwy829ay0AbZ46sMBUGkZUY9uaDW4DtQgXkATwbG6nBEwsxOtHPLqJRMhLIuTl4mEPhbLY53M51/Mu4D1AevcdDi6e4NRUhM9LX/6qns3D/UmLchX6O9cePmW0+j0/AQzErvO1mOVbpcjdQyMca+3FZVxMp6e5/SaFL32DPT6LJzdbHAK/85GiwPlSdYXg+Agfl1J4jJuyKghoMi5kCuzQcd4OhWjZCMAzY8yQQwAQB/YDvJx9zYPZGO9ycapA35YAVwOnudQ56FSOA13G/JmOsw/Rdcz+qRqXqU51yS8prNXlWrE9Ycf2NuJ/A6uf5JCErH2FAAAAAElFTkSuQmCC");

export async function getFaviconData(host) {
    let cached = storageGet(host, undefined, true);
    if (cached) {
        // console.log("Using cache for: " + host);
        return cached;
    }
    let response = await fetch("https://cors-anywhere.herokuapp.com/https://s2.googleusercontent.com/s2/favicons?domain=" + host);
    let blob = await response.blob();
    return new Promise(resolve => {
        let reader = new FileReader();
        reader.onloadend = function() {
            let data = reader.result;
            console.log(data);
            storageSet(host, data, true);
            resolve(data);
        }
        reader.readAsDataURL(blob);
    });
}

export async function getFaviconImg(host) {
    let data = await getFaviconData(host);
    return <img src={data}  alt=""/>
}

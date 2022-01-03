export function urlToDomain(url) {
    const regex = /^((?:http[s]?:\/\/)?(?:www.)?[\w.]+)/
    let matches = url.match(regex);
    return matches ? matches[1] : null;
}


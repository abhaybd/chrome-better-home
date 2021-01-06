import {useState, useEffect} from "react";
import {getFaviconImg} from "./FaviconAPI";
import "./PageElements.css";

function urlToFavicon(url) {
    const regex = /^(?:http[s]?:\/\/)?(?:www.)?([\w.]+)/;
    let host = url.match(regex)[1];
    if (host) {
        return getFaviconImg(host);
    } else {
        return null;
    }
}

export function Site(props) {
    const [url, setUrl] = useState(props.url);
    const [favicon, setFavicon] = useState(null);
    const [title, setTitle] = useState(props.title);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        console.log("Url changed!")
        if (url) {
            urlToFavicon(url).then(img => setFavicon(img));
        }
    }, [url]);

    function settingsClicked(e) {
        e.preventDefault();
        console.log("Clicked!");
    }

    return (
        <a className={"site-container"} href={url} onMouseEnter={() => setShowSettings(true)} onMouseLeave={() => setShowSettings(false)}>
            <div className={"options-button"} hidden={showSettings ? undefined : true} onClick={settingsClicked}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                     className="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                    <path
                        d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                </svg>
            </div>
            <div className={"favicon-container"}>
                {favicon}
            </div>
            <div className="site-title">
                {title}
            </div>
        </a>
    );
}

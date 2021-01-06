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
        console.log("Url changed! new: " + url);
        if (url) {
            urlToFavicon(url).then(img => setFavicon(img));
        }
    }, [url]);

    function settingsClicked(e) {
        e.preventDefault();
        console.log("Clicked!");
        if (props.showDialog) {
            props.showDialog({title: title, url: url}, settingsUpdated);
        }
    }

    function settingsUpdated(newTitle, newUrl) {
        setTitle(newTitle);
        setUrl(newUrl);
    }

    return (
        <a className={"site-container"} href={url} onMouseEnter={() => setShowSettings(true)}
           onMouseLeave={() => setShowSettings(false)}>
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

export function ConfigDialog(props) {
    const [title, setTitle] = useState(props.title ?? "");
    const [url, setUrl] = useState(props.url ?? "");

    function cancel() {
        console.log("Closing dialog!");
        props.close();
    }

    function save() {
        console.log("Closing dialog and saving!");
        console.log(props.callback);
        if (props.callback) {
            props.callback(title, url);
        }
        props.close();
    }

    return (
        <div className="config-dialog">
            <div className="close-config" onClick={cancel}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x"
                     viewBox="0 0 16 16">
                    <path
                        d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                </svg>
            </div>
            <label>
                Title:
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}/>
            </label>
            <label>
                URL:
                <input type="text" value={url} onChange={e => setUrl(e.target.value)}/>
            </label>
            <table className="dialog-buttons">
                <tbody>
                    <tr>
                        <td>
                            <button onClick={null/*TODO: implement delete*/} style={{color: "white", background: "red"}}>Delete</button>
                        </td>
                        <td>
                            <button onClick={cancel}>Cancel</button>
                        </td>
                        <td>
                            <button onClick={save} style={{color: "white", background: "green"}}>Save</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

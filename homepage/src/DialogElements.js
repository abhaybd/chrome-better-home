import React, {useState} from "react";
import "./DialogElements.css";

export function AddDialog(props) {
    const [type, setType] = useState("site");
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");

    function cancel() {
        props.close();
    }

    function save() {
        props.callback(title, type === "site" ? url : undefined);
        props.close();
    }

    let folderOption = null;
    if (props.canAddFolder) {
        folderOption = <option value="folder">Folder</option>;
    }

    return (
        <div className="config-dialog" style={{height: "150px"}}>
            <ConfigClose close={cancel}/>
            <select value={type} onChange={e => setType(e.target.value)}>
                <option value="site">Site</option>
                {folderOption}
            </select>
            <ConfigBody title={title} setTitle={setTitle} url={url} setUrl={setUrl} cancel={cancel} save={save}
                        hideDel={true} hideUrl={type !== "site"}/>
        </div>
    );
}

export function ConfigDialog(props) {
    const [title, setTitle] = useState(props.title ?? "");
    const [url, setUrl] = useState(props.url ?? "");

    function cancel() {
        console.log("Closing dialog!");
        props.close();
    }

    function del() {
        props.callback(null, null, true);
        props.close();
    }

    function save() {
        console.log("Closing dialog and saving!");
        props.callback(title, url);
        props.close();
    }

    return (
        <div className="config-dialog">
            <ConfigClose close={cancel}/>
            <ConfigBody title={title} setTitle={setTitle} url={url} setUrl={setUrl} del={del} cancel={cancel} save={save}/>
        </div>
    );
}

function ConfigClose(props) {
    return (
        <div className="close-config" onClick={props.close}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x"
                 viewBox="0 0 16 16">
                <path
                    d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
        </div>
    );
}

function ConfigBody(props) {
    let urlInput = null;
    if (!props.hideUrl) {
        urlInput = (
            <label>
                URL:
                <input type="text" value={props.url} onChange={e => props.setUrl(e.target.value)}/>
            </label>
        );
    }

    let delButton = null;
    if (!props.hideDel) {
        delButton = (
            <td>
                <button onClick={props.del} style={{color: "white", background: "red"}}>Delete</button>
            </td>
        );
    }

    return (
        <React.Fragment>
            <label>
                Title:
                <input type="text" value={props.title} onChange={e => props.setTitle(e.target.value)}/>
            </label>
            {urlInput}
            <table className="dialog-buttons">
                <tbody>
                    <tr>
                        {delButton}
                        <td>
                            <button onClick={props.cancel}>Cancel</button>
                        </td>
                        <td>
                            <button onClick={props.save} style={{color: "white", background: "green"}}>Save</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </React.Fragment>
    );
}

import React, {useState} from "react";
import "./DialogElements.css";
import {storageGet} from "./Storage";
import download from "downloadjs";

export function SettingsDialog(props) {
    function onFileChange(event) {
        let file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            let text = String(e.target.result);
            let data = JSON.parse(text);
            if (data.layout) {
                props.loadData(data);
            } else {
                alert("Invalid config file!");
            }
        }
        reader.onerror = e => alert("Error: " + e);
        reader.readAsText(file);
    }

    function downloadConfig() {
        let data = {};
        data.layout = storageGet("layout");
        data.hideAdd = storageGet("hideAdd");
        let dataStr = JSON.stringify(data);
        download(dataStr, "config.json", "application/json");
    }

    return (
        <div className="dialog-container">
            <div className="dialog settings-dialog">
                <DialogClose close={props.close}/>
                <h2>Settings</h2>
                <label>
                    <input type="checkbox" checked={props.hideAdd} onChange={e => props.setHideAdd(e.target.checked)}/>
                    Hide add button
                </label>
                <button onClick={props.clearStorage}>Clear all data</button>
                <label>
                    Upload config file
                    <input type="file" accept="application/json" onChange={onFileChange}/>
                </label>
                <button onClick={downloadConfig}>Download config file</button>
            </div>
        </div>
    );
}

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
        <div className="dialog-container">
            <div className="dialog">
                <DialogClose close={cancel}/>
                <select value={type} onChange={e => setType(e.target.value)}>
                    <option value="site">Site</option>
                    {folderOption}
                </select>
                <ConfigBody title={title} setTitle={setTitle} url={url} setUrl={setUrl} cancel={cancel} save={save}
                            hideDel={true} hideUrl={type !== "site"}/>
            </div>
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
        props.callback(title, props.url === undefined ? undefined : url);
        props.close();
    }

    return (
        <div className="dialog-container">
            <div className="dialog">
                <DialogClose close={cancel}/>
                <ConfigBody title={title} setTitle={setTitle} url={url} setUrl={setUrl} del={del} cancel={cancel}
                            save={save}
                            hideUrl={props.url === undefined}/>
            </div>
        </div>

    );
}

function DialogClose(props) {
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
                <button type="button" onClick={props.del} style={{color: "white", background: "red"}}>Delete</button>
            </td>
        );
    }

    function onSubmit(e) {
        e.preventDefault();
        e.stopPropagation();
        props.save();
    }

    return (
        <form onSubmit={onSubmit}>
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
                            <button type="button" onClick={props.cancel}>Cancel</button>
                        </td>
                        <td>
                            <button type="submit" style={{color: "white", background: "green"}}>Save</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </form>
    );
}

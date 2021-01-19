import React, {useState} from "react";
import "./DialogElements.css";
import {storageGet} from "./Storage";
import download from "downloadjs";

export function SettingsDialog(props) {
    function onConfigFileChange(event) {
        let file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
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
        data.background = storageGet("background");
        data.hideClock = storageGet("hideClock");
        data.iconsPerRow = storageGet("iconsPerRow");
        data.autoHideSettings = storageGet("autoHideSettings");
        let dataStr = JSON.stringify(data);
        download(dataStr, "config.json", "application/json");
    }

    function onBackgroundFileChange(event) {
        let file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function () {
            let dataUrl = reader.result;
            props.setBackground(dataUrl);
        }
        reader.onerror = e => alert("Error: " + e);
        reader.readAsDataURL(file);
    }

    return (
        <div className="dialog-container">
            <div className="dialog settings-dialog">
                <DialogClose close={props.close}/>
                <h2>Settings</h2>
                <h4>Configuration</h4>
                <label>
                    <div className="btn">Upload config file</div>
                    <input type="file" accept="application/json" onChange={onConfigFileChange} hidden/>
                </label>
                <div className="btn" onClick={downloadConfig}>Download config file</div>
                <h4>Display</h4>
                <label>
                    <input type="checkbox" checked={props.hideAdd} onChange={e => props.setHideAdd(e.target.checked)}/>
                    Hide 'add' button
                </label>
                <label>
                    <input type="checkbox" checked={props.hideClock}
                           onChange={e => props.setHideClock(e.target.checked)}/>
                    Hide clock
                </label>
                <label>
                    <input type="checkbox" checked={props.autoHideSettings}
                           onChange={e => props.setAutoHideSettings(e.target.checked)}/>
                    Auto-hide settings button
                </label>
                <label>
                    Number of icons per row: {props.iconsPerRow}
                    <input type="range" min="3" max="10" value={props.iconsPerRow}
                           onChange={e => props.setIconsPerRow(e.target.value)}/>
                </label>
                <label>
                    <div className="btn">Upload background image</div>
                    <input type="file" accept="image/*" onChange={onBackgroundFileChange} hidden/>
                </label>
                <div className="btn" onClick={() => props.setBackground(null)}>Reset background image</div>
                <h4>Data</h4>
                <div className="btn" onClick={props.clearStorage} style={{background: "#EF6666"}}>Clear all data</div>
            </div>
        </div>
    );
}

export function HelpDialog({close}) {
    return (
        <div className="dialog-container">
            <div className="dialog" style={{width: "600px", fontSize: "17px"}}>
                <DialogClose close={close}/>
                <h2>Hearth</h2>
                <p>Welcome to Hearth - A Better Homepage.</p>
                <h4>Settings Menu</h4>
                <p>
                    Hover your mouse over the top right corner to show the settings button.
                    Click it to access the settings page, where you can configure your homepage experience.
                    You can upload new background images, configure the number of columns, hide the add button, and more!
                </p>
                <h4>Sites & Folders</h4>
                <div>
                    <p>
                        Your homepage consists of many sites and folders, which help you navigate the web quickly.
                        You can have an arbitrary amount of sites on your homepage, as well as as many sites as you want
                        in a folder. A folder cannot contain another folder.
                    </p>
                    <p>
                        To edit the attributes of a site or folder, hover your mouse over its icon, and click the ⋮ button
                        in the top right. This will allow you to edit the title of the icon, as well as its URL if it's a site.
                    </p>
                </div>
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
                <h4>Type</h4>
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
            <>
                <h4>URL</h4>
                <input type="text" value={props.url} onChange={e => props.setUrl(e.target.value)}/>
            </>
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
            <h4>Title</h4>
            <input type="text" value={props.title} onChange={e => props.setTitle(e.target.value)}/>
            {urlInput}
            <table className="dialog-buttons">
                <tbody>
                    <tr>
                        {delButton}
                        <td>
                            <button type="submit" style={{color: "white", background: "green"}}>Save</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </form>
    );
}

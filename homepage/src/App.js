import './App.css';
import {useState} from 'react';
import React from "react";
import {ConfigDialog, SiteGroup} from "./PageElements";

function App() {
    const [sites, setSites] = useState([
        {title: "Gmail", url: "https://mail.google.com/mail/u/0/"},
        {title: "Gmail", url: "https://mail.google.com/mail/u/0/"},
        {title: "Gmail", url: "https://mail.google.com/mail/u/0/"},
        {title: "Gmail", url: "https://mail.google.com/mail/u/0/"},
        {
            title: "Folder", isOpen: false, content: [
                {title: "Gmail", url: "https://mail.google.com/mail/u/0/"},
                {title: "Gmail", url: "https://mail.google.com/mail/u/0/"},
                {title: "Gmail", url: "https://mail.google.com/mail/u/0/"}
            ]
        }]);
    const [currentlyEditing, setCurrentlyEditing] = useState(null); // id of site being edited, or null

    function showDialog(id) {
        if (!currentlyEditing) {
            console.log("Showing dialog!");
            setCurrentlyEditing(id);
        }
    }

    function closeDialog() {
        if (currentlyEditing !== null) {
            setCurrentlyEditing(null);
        }
    }

    function cloneData() {
        let copy = [];
        for (let data of sites) {
            if (data.content) {
                let content = [];
                for (let site of data.content) {
                    content.push(Object.assign({}, site));
                }
                let d = Object.assign({}, data);
                d.content = content;
                copy.push(d);
            } else {
                copy.push(Object.assign({}, data));
            }
        }
        return copy;
    }

    function setFolderOpen(id, open) {
        let copy = cloneData();
        console.log(id);
        console.log(copy);
        copy[id[0]].isOpen = true;
        setSites(copy);
    }

    function closeAllFolders() {
        let clone = cloneData();
        for (let data of clone) {
            if (data.content && data.isOpen === true) {
                data.isOpen = false;
            }
        }
        setSites(clone);
    }

    function updateSite(id, title, url, del = false) {
        if (url && !url.match(/^http[s]?:\/\//)) {
            url = "http://" + url;
        }
        let sitesCopy = cloneData();
        let arr, i;
        if (id.length === 1) {
            arr = sitesCopy;
            i = id[0];
        } else {
            arr = sitesCopy[id[0]].content;
            i = id[1];
        }
        if (del === true) {
            arr.splice(i, 1);
        } else {
            arr[i].title = title;
            if (!arr[i].content) { // if it's not a folder
                arr[i].url = url;
            }
        }
        setSites(sitesCopy);
    }

    function add(id) {
        let sitesCopy = cloneData();
        if (id.length === 0) {
            sitesCopy.push({title: "", url: ""});
        } else {
            sitesCopy[id[0]].content.push({title: "", url: ""});
        }

        setSites(sitesCopy);
    }

    function getSite(id) {
        if (id.length === 1) {
            return sites[id[0]];
        } else {
            return sites[id[0]].content[id[1]];
        }
    }

    let config = null;
    if (currentlyEditing !== null) {
        console.log(currentlyEditing);
        let {title, url} = getSite(currentlyEditing);
        config = <ConfigDialog title={title} url={url} close={closeDialog}
                               callback={(title, url, del) => updateSite(currentlyEditing, title, url, del)}/>
    }

    return (
        <div className="App">
            <header className="App-header" onClick={() => closeAllFolders()}>
                <div onClick={e => e.stopPropagation()}>
                    {config}
                    <SiteGroup id={[]} showDialog={showDialog} sites={sites} add={add} setOpen={setFolderOpen}/>
                </div>
            </header>
        </div>
    );
}

export default App;

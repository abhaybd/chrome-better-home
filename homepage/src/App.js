import './App.css';
import React, {useState, useEffect} from 'react';
import {SiteGroup} from "./PageElements";
import {AddDialog, ConfigDialog} from "./DialogElements";
import {storageGet, storageSet} from "./Storage";

const defaultSites = [
    {title: "Gmail", url: "https://mail.google.com/mail/u/0/"},
    {title: "Facebook", url: "https://www.facebook.com/"},
    {title: "Twitter", url: "https://twitter.com/home"}
];

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
    const [currentlyAddingTo, setCurrentlyAddingTo] = useState(null); // id of group being added to, or null

    useEffect(function() {
        let saved = storageGet("layout", undefined, true);
        if (saved) {
            setSites(saved);
        } else {
            setSites(defaultSites);
            storageSet("layout", defaultSites, true);
        }
    }, []);

    useEffect(function() {
        storageSet("layout", sites, true);
    }, [sites]);

    function showConfigDialog(id) {
        if (!currentlyEditing) {
            console.log("Showing dialog!");
            setCurrentlyEditing(id);
        }
    }

    function showAddDialog(id) {
        if (!currentlyAddingTo) {
            setCurrentlyAddingTo(id);
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
        copy[id[0]].isOpen = open;
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

    function add(id, title, url) {
        let sitesCopy = cloneData();
        let added = {title: title};
        if (url !== undefined) {
            added.url = url;
        } else {
            added.isOpen = false;
            added.content = [];
        }
        if (id.length === 0) {
            sitesCopy.push(added);
        } else {
            sitesCopy[id[0]].content.push(added);
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
        config = <ConfigDialog title={title} url={url} close={() => setCurrentlyEditing(null)}
                               callback={(title, url, del) => updateSite(currentlyEditing, title, url, del)}/>
    }

    let addDialog = null;
    if (currentlyAddingTo !== null) {
        let id = currentlyAddingTo;
        addDialog = <AddDialog close={() => setCurrentlyAddingTo(null)} canAddFolder={id.length === 0}
                               callback={(title, url) => add(id, title, url)}/>;
    }

    return (
        <div className="App">
            <header className="App-header" onClick={() => closeAllFolders()}>
                <div onClick={e => e.stopPropagation()}>
                    {config}
                    {addDialog}
                    <SiteGroup id={[]} showDialog={showConfigDialog} sites={sites} add={showAddDialog}
                               setOpen={setFolderOpen}/>
                </div>
            </header>
        </div>
    );
}

export default App;

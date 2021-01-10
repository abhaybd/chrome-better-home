import './App.css';
import React, {useState, useEffect} from 'react';
import {SettingsButton, SiteGroup} from "./PageElements";
import {AddDialog, ConfigDialog, SettingsDialog} from "./DialogElements";
import {storageGet, storageSet} from "./Storage";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";

const defaultSites = [
    {id: "0", title: "Gmail", url: "https://mail.google.com/mail/u/0/"},
    {id: "1", title: "Facebook", url: "https://www.facebook.com/"},
    {id: "2", title: "Twitter", url: "https://twitter.com/home"}
];

function getTimeStr() {
    return String(performance.now ? performance.now() : Date.now());
}

function ensureProtocol(url) {
    return url && !url.match(/^http[s]?:\/\//) ? "http://" + url : url;
}

function App() {
    const [sites, setSites] = useState([]);
    const [showSettings, setShowSettings] = useState(false);
    const [currentlyEditing, setCurrentlyEditing] = useState(null); // id of site being edited, or null
    const [currentlyAddingTo, setCurrentlyAddingTo] = useState(null); // id of group being added to, or null
    const [hideAdd, setHideAdd] = useState(false);

    useEffect(function() {
        let saved = storageGet("layout", undefined, true);
        if (saved) {
            setSites(saved);
        } else {
            setSites(defaultSites);
            storageSet("layout", defaultSites, true);
        }

        setHideAdd(storageGet("hideAdd", false, true));
    }, []);

    useEffect(function() {
        storageSet("layout", sites, true);
    }, [sites]);

    useEffect(function() {
        storageSet("hideAdd", hideAdd);
    }, [hideAdd]);

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
            if (data.content !== undefined) {
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
        let {index: idx} = getElementById(id);
        copy[idx[0]].isOpen = open;
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

    function updateSite(idx, title, url, del = false) {
        url = ensureProtocol(url);
        let sitesCopy = cloneData();
        let arr, i;
        if (idx.length === 1) {
            arr = sitesCopy;
            i = idx[0];
        } else {
            arr = sitesCopy[idx[0]].content;
            i = idx[1];
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
        let added = {title: title, id: getTimeStr()};
        if (url !== undefined) {
            added.url = ensureProtocol(url);
        } else {
            added.isOpen = false;
            added.content = [];
        }
        if (id === -1) {
            sitesCopy.push(added);
        } else {
            let {index: idx} = getElementById(id);
            sitesCopy[idx[0]].content.push(added);
        }

        setSites(sitesCopy);
    }

    function getElementById(id) {
        for (let i = 0; i < sites.length; i++) {
            let data = sites[i];
            if (data.id === id) {
                return {index: [i], elem: data};
            } else if (data.content) {
                for (let j = 0; j < data.content.length; j++) {
                    let d = data.content[j];
                    if (d.id === id) {
                        return {index: [i,j], elem: d};
                    }
                }
            }
        }
        return {index: undefined, elem: undefined};
    }

    let config = null;
    if (currentlyEditing !== null) {
        let {index: idx, elem:{title, url}} = getElementById(currentlyEditing);
        config = <ConfigDialog title={title} url={url} close={() => setCurrentlyEditing(null)}
                               callback={(title, url, del) => updateSite(idx, title, url, del)}/>
    }

    let addDialog = null;
    if (currentlyAddingTo !== null) {
        let id = currentlyAddingTo;
        addDialog = <AddDialog close={() => setCurrentlyAddingTo(null)} canAddFolder={id === -1}
                               callback={(title, url) => add(id, title, url)}/>;
    }

    let settingsDialog = null;
    if (showSettings) {
        settingsDialog = <SettingsDialog hideAdd={hideAdd} setHideAdd={setHideAdd} close={() => setShowSettings(false)}/>;
    }

    function move(id, toId, intoFolder = false) {
        let {index: idx} = getElementById(id);
        let {index: toIdx} = getElementById(toId);
        let copy = cloneData();
        let elem;
        let fromArr;
        if (idx.length === 1) {
            elem = copy[idx[0]];
            fromArr = copy;
        } else {
            fromArr = copy[idx[0]].content;
            elem = fromArr[idx[1]];
        }

        let toArr;
        if (toIdx.length === 1) {
            if (intoFolder === true && copy[toIdx[0]].content !== undefined) {
                toArr = copy[toIdx[0]].content;
                toIdx[0] = toArr.length;
            } else {
                toArr = copy;
            }
        } else {
            toArr = copy[toIdx[0]].content;
        }
        fromArr.splice(idx[idx.length-1], 1);
        toArr.splice(toIdx[toIdx.length-1], 0, elem);
        setSites(copy);
    }

    return (
        <div className="App">
            <header className="App-header" onClick={() => closeAllFolders()}>
                <div onClick={e => e.stopPropagation()}>
                    <SettingsButton openSettings={() => setShowSettings(true)}/>
                </div>
                <div onClick={e => e.stopPropagation()}>
                    {settingsDialog}
                    {config}
                    {addDialog}
                    <DndProvider backend={HTML5Backend}>
                        <SiteGroup showDialog={showConfigDialog} sites={sites} add={showAddDialog} id={-1}
                                   setOpen={setFolderOpen} hideAdd={hideAdd} move={move}/>
                    </DndProvider>
                </div>
            </header>
        </div>
    );
}

export default App;

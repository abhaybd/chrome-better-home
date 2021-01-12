import './App.css';
import React, {useState, useEffect} from 'react';
import {SettingsButton, SiteGroup} from "./PageElements";
import {AddDialog, ConfigDialog, SettingsDialog} from "./DialogElements";
import {storageGet, storageSet, storageClear} from "./Storage";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import DefaultBackground from "./space.jpg";
import Clock from "./ClockWidget";

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
    const [dialogsDisabled, setDialogsDisabled] = useState(false);
    const [background, setBackground] = useState(null);
    const [hideClock, setHideClock] = useState(false);

    useEffect(function () {
        let saved = storageGet("layout");
        if (saved) {
            setSites(saved);
        } else {
            setSites(defaultSites);
            storageSet("layout", defaultSites);
        }

        let background = storageGet("background");
        if (background) {
            setBackground(background);
        }

        setHideAdd(storageGet("hideAdd", false));
        setBackground(storageGet("background"));
        setHideClock(storageGet("hideClock", false));
    }, []);

    useEffect(function () {
        storageSet("layout", sites);
    }, [sites]);

    useEffect(function () {
        storageSet("hideAdd", hideAdd);
    }, [hideAdd]);

    useEffect(function () {
        storageSet("hideClock", hideClock);
    }, [hideClock]);

    useEffect(function () {
        setDialogsDisabled(!!currentlyEditing || !!currentlyAddingTo || !!showSettings);
    }, [currentlyAddingTo, currentlyEditing, showSettings]);

    useEffect(function () {
        storageSet("background", background);
    }, [background]);

    function showConfigDialog(id) {
        if (!dialogsDisabled) {
            setCurrentlyEditing(id);
        }
    }

    function showAddDialog(id) {
        if (!dialogsDisabled) {
            setCurrentlyAddingTo(id);
        }
    }

    function showSettingsMenu() {
        if (!dialogsDisabled) {
            setShowSettings(true);
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
                        return {index: [i, j], elem: d};
                    }
                }
            }
        }
        return {index: undefined, elem: undefined};
    }

    function clearStorage() {
        if (window.confirm("Are you sure? This will reset all settings as well as your homepage.")) {
            storageClear();
            setSites(defaultSites);
        }
    }

    function loadData({layout, hideAdd}) {
        setSites(layout);
        setHideAdd(hideAdd);
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
        fromArr.splice(idx[idx.length - 1], 1);
        toArr.splice(toIdx[toIdx.length - 1], 0, elem);
        setSites(copy);
    }

    let config = null;
    if (currentlyEditing !== null) {
        let {index: idx, elem: {title, url}} = getElementById(currentlyEditing);
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
        settingsDialog = <SettingsDialog hideAdd={hideAdd} setHideAdd={setHideAdd} close={() => setShowSettings(false)}
                                         clearStorage={clearStorage} loadData={loadData} setBackground={setBackground}
                                         hideClock={hideClock} setHideClock={setHideClock}/>;
    }

    return (
        <div className="App" style={{background: `url(${background ?? DefaultBackground}) center`}}>
            <header className="App-header" onClick={() => closeAllFolders()}>
                <div onClick={e => e.stopPropagation()}>
                    <SettingsButton openSettings={showSettingsMenu}/>
                </div>
                <div onClick={e => e.stopPropagation()}>
                    {settingsDialog}
                    {config}
                    {addDialog}
                    {hideClock ? null : <Clock/>}
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

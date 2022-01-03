import './App.css';
import React, {useState, useEffect, useCallback} from 'react';
import {RootDropTarget, SettingsButton, SiteGroup} from "./PageElements";
import {AddDialog, ConfigDialog, SettingsDialog, HelpDialog} from "./DialogElements";
import {storageGet, storageSet, storageClear} from "./Storage";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import DefaultBackground from "./space.jpg";
import Clock from "./ClockWidget";
import {removeFaviconData} from "./FaviconAPI";
import {urlToDomain} from "./utils";

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
    const [iconsPerRow, setIconsPerRow] = useState(5);
    const [showHelp, setShowHelp] = useState(false);
    const [autoHideSettings, setAutoHideSettings] = useState(false);

    const cloneData = useCallback(function() {
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
    }, [sites]);

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
        setIconsPerRow(storageGet("iconsPerRow", 5));

        let seenHelp = storageGet("seenHelp", false);
        if (!seenHelp) {
            setShowHelp(true);
            storageSet("seenHelp", true);
        }

        setAutoHideSettings(storageGet("autoHideSettings", false));

        // yes, this is fucked up. whatever. It silences the (possibly) harmless invariant errors from react-dnd.
        window.onerror = e => e === "Uncaught Invariant Violation: Expected to find a valid target.";
    }, []);

    useEffect(function () {
        let copy = cloneData();
        // Don't save the folders as being open
        for (let data of copy) {
            if (data.isOpen === true) {
                data.isOpen = false;
            }
        }
        storageSet("layout", copy);
    }, [sites, cloneData]);

    useEffect(function () {
        storageSet("hideAdd", hideAdd);
    }, [hideAdd]);

    useEffect(function () {
        storageSet("hideClock", hideClock);
    }, [hideClock]);

    useEffect(function () {
        setDialogsDisabled(!!currentlyEditing || !!currentlyAddingTo || !!showSettings || !!showHelp);
    }, [currentlyAddingTo, currentlyEditing, showSettings, showHelp]);

    useEffect(function () {
        storageSet("background", background);
    }, [background]);

    useEffect(function () {
        storageSet("iconsPerRow", iconsPerRow);
    }, [iconsPerRow]);

    useEffect(function() {
        storageSet("autoHideSettings", autoHideSettings);
    }, [autoHideSettings]);

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
            let [removed] = arr.splice(i, 1);
            // remove data from cache
            if (removed.url) {
                // remove single site
                console.log(`Removing cached data for host: ${removed.url}`);
                let host = urlToDomain(removed.url);
                removeFaviconData(host);
            } else {
                // remove sites in folder
                for (let site of removed.content) {
                    console.log(`Removing cached data for host: ${site.url}`);
                    let host = urlToDomain(site.url);
                    removeFaviconData(host);
                }
            }
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

    function loadData({layout, hideAdd, background, hideClock, iconsPerRow, autoHideSettings}) {
        setSites(layout);
        setHideAdd(hideAdd);
        setBackground(background);
        setHideClock(hideClock);
        setIconsPerRow(iconsPerRow);
        setAutoHideSettings(autoHideSettings);
    }

    // to is either an index (array of indices) or an id
    function move(id, to, intoFolder = false) {
        let {index: idx} = getElementById(id);
        let toIdx;
        // this is a hack to avoid creating a new method
        if (to instanceof Array) {
            toIdx = to;
        } else {
            let {index: i} = getElementById(to);
            toIdx = i;
        }
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
                                         hideClock={hideClock} setHideClock={setHideClock} iconsPerRow={iconsPerRow}
                                         setIconsPerRow={setIconsPerRow} autoHideSettings={autoHideSettings}
                                         setAutoHideSettings={setAutoHideSettings}/>;
    }

    let helpDialog = null;
    if (showHelp) {
        helpDialog = <HelpDialog close={() => setShowHelp(false)}/>
    }

    return (
        <div className="App" style={{background: `url(${background ?? DefaultBackground}) center`}}>
            <header className="App-header" onClick={() => closeAllFolders()}>
                <div onClick={e => e.stopPropagation()}>
                    <SettingsButton openSettings={showSettingsMenu} autoHide={autoHideSettings}/>
                </div>
                <div onClick={e => e.stopPropagation()}>
                    {helpDialog}
                    {settingsDialog}
                    {config}
                    {addDialog}
                    {hideClock ? null : <Clock/>}
                    <DndProvider backend={HTML5Backend}>
                        <div style={{width: "100%", position:"relative"}}>
                            <RootDropTarget left={true} move={move} sites={sites} />
                            <RootDropTarget left={false} move={move} sites={sites} />
                            <SiteGroup showDialog={showConfigDialog} sites={sites} add={showAddDialog} id={-1}
                                       setOpen={setFolderOpen} hideAdd={hideAdd} move={move}
                                       width={`${iconsPerRow * 100}px`}/>
                        </div>
                    </DndProvider>
                </div>
            </header>
        </div>
    );
}

export default App;

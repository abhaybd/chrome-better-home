import React, {useEffect, useState} from "react";
import {getFaviconImg} from "./FaviconAPI";
import "./PageElements.css";
import {useDrag, useDrop} from "react-dnd";

async function urlToFavicon(url) {
    if (!url) {
        return null;
    }
    const regex = /^(?:http[s]?:\/\/)?(?:www.)?([\w.]+)/;
    let matches = url.match(regex);
    let host = matches ? matches[1] : null;
    if (host) {
        return await getFaviconImg(host);
    } else {
        return null;
    }
}

export function SettingsButton(props) {
    const [show, setShow] = useState(false);

    let button = null;
    if(show) {
        button = (
            <div className="settings-button" onClick={() => props.openSettings()}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                     className="bi bi-gear-fill" viewBox="0 0 16 16">
                    <path
                        d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                </svg>
            </div>
        );
    }

    return (
        <div className="settings-button-container" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
            {button}
        </div>
    );
}

export function SiteGroup(props) {
    function createElem(data, i) {
        let id = data.id;
        if (data.content) { // data is folder
            return <Folder key={i} id={id} content={data.content} title={data.title} isOpen={data.isOpen} move={props.move}
                           setOpen={props.setOpen} showDialog={props.showDialog} add={props.add} hideAdd={props.hideAdd}/>
        } else {
            return <Site canAcceptFolder={props.id === -1} key={i} move={props.move} id={id} showDialog={props.showDialog}
                         url={data.url} title={data.title}/>
        }
    }

    return (
        <div className="site-group" style={{width: props.width ?? "50vw"}}>
            {props.sites.map((data, i) => createElem(data, i))}
            {props.hideAdd ? null : <AddButton add={() => props.add(props.id)} />}
        </div>
    );
}

export function AddButton(props) {
    return (
        <div className="site-container" style={{cursor: "pointer"}} onClick={props.add}>
            <div className="favicon-container" style={{color: "gray"}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor"
                     className="bi bi-plus" viewBox="0 0 16 16">
                    <path
                        d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                </svg>
            </div>
            <div className="site-title">
                Add
            </div>
        </div>
    );
}

export function Site(props) {
    const [, drag] = useDrag({
        item: {type: "site", id: props.id}
    });

    const [,drop] = useDrop({
        accept: props.canAcceptFolder ? ["site", "folder"] : "site",
        canDrop: () => false,
        hover: function(item) {
            let draggedId = item.id;
            if (draggedId !== props.id) {
                console.log(props.id);
                console.log(draggedId);
                props.move(draggedId, props.id);
            }
        }
    });

    const [favicon, setFavicon] = useState(null);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        // console.log("Url changed! new: " + props.url);
        if (props.url) {
            urlToFavicon(props.url).then(img => setFavicon(img));
        }
    }, [props.url]);

    function settingsClicked(e) {
        e.preventDefault();
        console.log("Clicked!");
        props.showDialog(props.id);
    }

    return (
        <a ref={node => drag(drop(node))} className={"site-container"} href={props.url} onMouseEnter={() => setShowSettings(true)}
           onMouseLeave={() => setShowSettings(false)}>
            <div className="options-button" hidden={showSettings ? undefined : true} onClick={settingsClicked}>
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
                {props.title}
            </div>
        </a>
    );
}

function FolderContent({title, content, id, cols, rows, add, showDialog, move, hideAdd}) {
    const [, drop] = useDrop({
        accept: "site",
        hover: function(item, monitor) {
            let draggedId = item.id;
            let elemInFolder = content.filter(x => x.id === draggedId).length !== 0;
            if (draggedId !== id && !elemInFolder) {
                console.log(id);
                console.log(draggedId);
                move(draggedId, id, true);
            }
        }
    });

    let titleElem = null;
    if (title) {
        titleElem = (
            <div style={{width: "100%", background: "#586478", marginBottom: "-1px"}}>
                {title}
            </div>
        )
    }

    return (
        <div ref={drop} className="folder">
            <div style={{width: cols*100, height: rows*100, background: "#23272E", margin: "10px"}}>
                <SiteGroup width="100%" add={add} sites={content} hideAdd={hideAdd}
                           showDialog={showDialog} move={move} id={id}/>
            </div>
            {titleElem}
        </div>
    );
}

export function Folder(props) {
    const [, drag] = useDrag({
        item: {type: "folder", id: props.id}
    });

    const [,drop] = useDrop({
        accept: ["site", "folder"],
        canDrop: () => props.isOpen,
        hover: function(item, monitor) {
            let draggedId = item.id;
            if (draggedId !== props.id && monitor.isOver({shallow: true})) {
                console.log(props.id);
                console.log(draggedId);
                props.move(draggedId, props.id);
            }
        }
    });

    const [showSettings, setShowSettings] = useState(false);
    const [favicons, setFavicons] = useState([]);

    let len = props.content.length + (props.hideAdd ? 0 : 1); // add one to account for add icon, if not hidden
    let cols = Math.max(2, Math.ceil(Math.sqrt(len)));
    let rows = Math.max(1, Math.ceil(len / cols));

    useEffect(function() {
        let promises = props.content.slice(0, 4).map(site => urlToFavicon(site.url));
        Promise.all(promises).then(setFavicons);
    }, [props.content]);

    function settingsClicked(e) {
        e.stopPropagation();
        console.log("Folder settings!");
        props.showDialog(props.id);
    }

    let folderContent = null;
    if (props.isOpen === true) {
        folderContent = <FolderContent {...props} cols={cols} rows={rows}/>
    }

    return (
        <div ref={node => drag(drop(node))} className="site-container" style={{cursor: "pointer"}}
             onClick={() => props.setOpen(props.id, true)} onMouseEnter={() => setShowSettings(true)}
             onMouseLeave={() => setShowSettings(false)}>
            {folderContent}
            <div className="options-button" hidden={showSettings ? undefined : true} onClick={settingsClicked}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                     className="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                    <path
                        d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                </svg>
            </div>
            <div className="favicon-container folder-icon">
                {favicons.map((f,i) => <React.Fragment key={i}>{f}</React.Fragment>)}
            </div>
            <div className="site-title">
                {props.title}
            </div>
        </div>
    );
}


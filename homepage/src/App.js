import './App.css';
import {useState} from 'react';
import {storageGet, storageSet} from "./Storage";
import {ConfigDialog, SiteGroup} from "./PageElements";

function App() {
    const [sites, setSites] = useState([{title:"Gmail", url:"https://mail.google.com/mail/u/0/"},{title:"Gmail", url:"https://mail.google.com/mail/u/0/"},{title:"Gmail", url:"https://mail.google.com/mail/u/0/"},{title:"Gmail", url:"https://mail.google.com/mail/u/0/"}]);
    const [currentlyEditing, setCurrentlyEditing] = useState(null); // index of site being edited, or null

    function showDialog(index) {
        if (!currentlyEditing) {
            console.log("Showing dialog!");
            setCurrentlyEditing(index);
        }
    }

    function closeDialog() {
        if (currentlyEditing !== null) {
            setCurrentlyEditing(null);
        }
    }

    function updateSite(i, title, url, del=false) {
        if (!url.match(/^http[s]?:\/\//)) {
            url = "http://" + url;
        }
        let sitesCopy = [...sites];
        if (del === true) {
            sitesCopy.splice(i, 1);
        } else {
            sitesCopy[i] = {title: title, url: url};
        }
        setSites(sitesCopy);
    }

    function add() {
        let sitesCopy = [...sites];
        sitesCopy.push({title:"", url:""});
        setSites(sitesCopy);
    }

    let config = null;
    if (currentlyEditing !== null) {
        let {title, url} = sites[currentlyEditing];
        config = <ConfigDialog title={title} url={url} close={closeDialog}
                               callback={(title, url, del) => updateSite(currentlyEditing, title, url, del)} />
    }

    return (
        <div className="App">
            <header className="App-header">
                {config}
                <SiteGroup showDialog={showDialog} sites={sites} add={add}/>
            </header>
        </div>
    );
}

export default App;

import './App.css';
import {useState, useEffect} from 'react';
import {getFaviconImg} from "./FaviconAPI";
import {storageGet, storageSet} from "./Storage";
import {ConfigDialog, SiteGroup} from "./PageElements";

function App() {
    const [foo, setFoo] = useState("null");
    const [image, setImage] = useState(null);
    const [dialogConfig, setDialogConfig] = useState({enabled:false});

    useEffect(() => {
        setFoo(storageGet("key", "null"));
        storageSet("key", "foobar");

        getFaviconImg("mail.google.com").then(data => setImage(data));
    }, []);

    function showDialog(currConfig, callback) {
        if (!dialogConfig.enabled) {
            console.log("Showing dialog!");
            console.log(callback);
            setDialogConfig({enabled:true, currConfig: currConfig, callback:callback});
        }
    }

    let config = null;
    console.log(dialogConfig);
    if (dialogConfig.enabled) {
        console.log("Set up!")
        let {title, url} = dialogConfig.currConfig;
        config = <ConfigDialog title={title} url={url} close={() => setDialogConfig({enabled:false})} callback={dialogConfig.callback}/>;
    }

    return (
        <div className="App">
            <header className="App-header">
                {config}
                <SiteGroup showDialog={showDialog} />
            </header>
        </div>
    );
}

export default App;

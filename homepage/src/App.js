import './App.css';
import {useState, useEffect} from 'react';
import {getFaviconImg} from "./FaviconAPI";
import {storageGet, storageSet} from "./Storage";
import {Site} from "./PageElements";

function App() {
    const [foo, setFoo] = useState("null");
    const [image, setImage] = useState(null);

    useEffect(() => {
        setFoo(storageGet("key", "null"));
        storageSet("key", "foobar");

        getFaviconImg("mail.google.com").then(data => setImage(data));
    }, []);


    return (
        <div className="App">
            <header className="App-header">
                <p>
                    Stored test: {foo}
                </p>
                <p>
                    Favicon:
                    {image}
                </p>
                <div>
                    <Site url="https://mail.google.com/mail/u/0/" title="Gmail" />
                </div>
            </header>
        </div>
    );
}

export default App;

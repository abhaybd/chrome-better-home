import logo from './logo.svg';
import './App.css';
import {useState, useEffect} from 'react';
import {getFaviconImg} from "./FaviconAPI";
import {storageGet} from "./ChromeAPI";

function App() {
    const [foo, setFoo] = useState("null");
    const [image, setImage] = useState(null);

    useEffect(() => {
        storageGet("key").then(val => setFoo(val));

        getFaviconImg("mail.google.com").then(data => setImage(data));
    }, []);


    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo"/>
                <p>
                    Edit <code>src/App.js</code> and save to reload.
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
                <p>
                    Stored test: {foo}
                </p>
                <p>
                    Favicon:
                    {image}
                </p>
            </header>
        </div>
    );
}

export default App;

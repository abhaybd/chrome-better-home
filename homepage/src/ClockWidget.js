import React, {useEffect, useState} from "react";
import "./Clock.css";

export default function Clock() {
    const [time, setTime] = useState(null);

    useEffect(function () {
        setTime(new Date());
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div id="clock">
            {time?.toLocaleTimeString([], {hour: "numeric", minute: "2-digit"})}
        </div>
    );
}

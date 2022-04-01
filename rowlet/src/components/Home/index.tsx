import React, { useState, useEffect } from "react";
import { nanoid } from 'nanoid'

function Home() {
    const [content, setContent] = useState<string>("Nothing");
    useEffect(() => {
        const evInstance = new EventSource(
            `http://localhost:3001/connect/${nanoid()}`
        );
        evInstance.onmessage = (e) => {
            setContent(e.data);
        };
    }, []);

    return (
        <>
            <header className="App-header">
                <h1>{content}</h1>
            </header>
        </>
    );
}

export default Home;
